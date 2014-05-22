function musicify() {
    var Synth = function(audiolet, frequency) {
        AudioletGroup.apply(this, [audiolet, 0, 1]);
        this.audiolet = new Audiolet();
        this.sine = new Sine(this.audiolet, frequency);

        this.gain = new Gain(this.audiolet);
        this.envelope = new PercussiveEnvelope(this.audiolet, 1, 0.2, 0.5,
            function() {
                this.audiolet.scheduler.addRelative(0, this.remove.bind(this));
            }.bind(this)
        );

        this.modulator = new Saw(this.audiolet, 2 * frequency);
        this.modulatorMulAdd = new MulAdd(this.audiolet, frequency / 2, frequency);
        this.modulator.connect(this.modulatorMulAdd);
        this.modulatorMulAdd.connect(this.sine);

        this.envelope.connect(this.gain, 0, 1);
        this.sine.connect(this.gain);
        this.gain.connect(this.outputs[0]);
    };
    extend(Synth, AudioletGroup);

    var AudioletApp = function() {
        this.audiolet = new Audiolet();
        var text = document.getElementById("input_text").value;
        var frequencyPattern = new PSequence(text_to_frequencies_pentatonic(text));
        this.audiolet.scheduler.play([frequencyPattern], 1,
            function(frequency) {
                var synth = new Synth(this.audiolet, frequency);
                synth.connect(this.audiolet.output);
            }.bind(this)
        );
    };

    var text_to_frequencies_pentatonic = function(text) {
        var notes = text_to_pentatonic_note_octave_pairs(text);
        return pentatonic_note_octave_pairs_to_frequencies(notes);
    }

    var text_to_pentatonic_note_octave_pairs = function(text) {
        var letter,
            note,
            octave,
            notes = [];

        for (i = 0; i < text.length; i++) {
            letter = text[i];
            if (is_alpha(letter)) {
                note = letter_to_pentatonic_note(letter);
                octave = letter_to_pentatonic_octave(letter);
                notes.push([note, octave]);
            }
        }

        return notes;
    }

    var letter_to_pentatonic_note = function(letter) {
        return letter_index(letter) % 5;
    }

    var letter_to_pentatonic_octave = function(letter) {
        return Math.floor(letter_index(letter) / 5);
    }

    var letter_index = function(letter) {
        letter = letter.toLowerCase();
        return (letter.charCodeAt() - 'a'.charCodeAt());
    }

    var is_alpha = function(letter) {
        letter = letter.toLowerCase();
        return 'a' <= letter && letter <= 'z';
    }

    var pentatonic_note_octave_pairs_to_frequencies = function(notes) {
        var frequency,
            frequencies = [];

        for(i = 0; i < notes.length; i++) {
            frequency = pentatonic_note_octave_pair_to_frequency(notes[i]);
            frequencies.push(frequency);
        }

        return frequencies;
    }

    var pentatonic_note_octave_pair_to_frequency = function(note) {
        return pentatonic_scale.getFrequency(note[0], 55, note[1]);
    }

    var PentatonicScale = function() {
        var degrees = [0, 2, 4, 7, 9];
        Scale.call(this, degrees);
    };
    extend(PentatonicScale, Scale);
    var pentatonic_scale = new PentatonicScale();

    var text_to_frequencies_chromatic = function(text) {
        var notes = text_to_chromatic_note_octave_pairs(text);
        return chromatic_note_octave_pairs_to_frequencies(notes);
    }

    var text_to_chromatic_note_octave_pairs = function(text) {
        var letter,
            note,
            octave,
            notes = [];

        for (i = 0; i < text.length; i++) {
            letter = text[i];
            if (is_alpha(letter)) {
                note = letter_to_chromatic_note(letter);
                octave = letter_to_chromatic_octave(letter);
                notes.push([note, octave]);
            }
        }

        return notes;
    }

    var letter_to_chromatic_note = function(letter) {
        return letter_index(letter) % 12;
    }

    var letter_to_chromatic_octave = function(letter) {
        return Math.floor(letter_index(letter) / 12);
    }

    var chromatic_note_octave_pairs_to_frequencies = function(notes) {
        var frequency,
            frequencies = [];

        for(i = 0; i < notes.length; i++) {
            frequency = chromatic_note_octave_pair_to_frequency(notes[i]);
            frequencies.push(frequency);
        }

        return frequencies;
    }

    var chromatic_note_octave_pair_to_frequency = function(note) {
        note_map = {
            'A': [55.000, 110.000, 220.000, 440.000, 880.000, 1760.000, 3520.000],
            'A#': [58.270, 116.541, 233.082, 466.164, 932.328, 1864.655],
            'Bb': [58.270, 116.541, 233.082, 466.164, 932.328, 1864.655],
            'B': [61.735, 123.471, 246.942, 493.883, 987.767, 1975.533],
            'C': [65.406, 130.813, 261.626, 523.251, 1046.502, 2093.005],
            'C#': [69.296, 138.591, 277.183, 554.365, 1108.731, 2217.461],
            'Db': [69.296, 138.591, 277.183, 554.365, 1108.731, 2217.461],
            'D': [73.416, 146.832, 293.665, 587.330, 1174.659, 2349.318],
            'D#': [77.782, 155.563, 311.127, 622.254, 1244.508, 2489.016],
            'Eb': [77.782, 155.563, 311.127, 622.254, 1244.508, 2489.016],
            'E': [82.407, 164.814, 329.628, 659.255, 1318.510, 2637.020],
            'F': [87.307, 174.614, 349.228, 698.456, 1396.913, 2793.826],
            'F#': [92.499, 184.997, 369.994, 739.989, 1479.978, 2959.955],
            'Gb': [92.499, 184.997, 369.994, 739.989, 1479.978, 2959.955],
            'G': [97.999, 195.998, 391.995, 783.991, 1567.982, 3135.963],
            'G#': [103.826, 207.652, 415.305, 830.609, 1661.219, 3322.438],
            'Ab': [103.826, 207.652, 415.305, 830.609, 1661.219, 3322.438]
        };
        note_array = [
            [55.000, 110.000, 220.000, 440.000, 880.000, 1760.000, 3520.000], // A
            [58.270, 116.541, 233.082, 466.164, 932.328, 1864.655], // A#
            [58.270, 116.541, 233.082, 466.164, 932.328, 1864.655], // Bb
            [61.735, 123.471, 246.942, 493.883, 987.767, 1975.533], // B
            [65.406, 130.813, 261.626, 523.251, 1046.502, 2093.005], // C
            [69.296, 138.591, 277.183, 554.365, 1108.731, 2217.461], // C#
            [69.296, 138.591, 277.183, 554.365, 1108.731, 2217.461], // Db
            [73.416, 146.832, 293.665, 587.330, 1174.659, 2349.318], // D
            [77.782, 155.563, 311.127, 622.254, 1244.508, 2489.016], // D#
            [77.782, 155.563, 311.127, 622.254, 1244.508, 2489.016], // Eb
            [82.407, 164.814, 329.628, 659.255, 1318.510, 2637.020], // E
            [87.307, 174.614, 349.228, 698.456, 1396.913, 2793.826], // F
            [92.499, 184.997, 369.994, 739.989, 1479.978, 2959.955], // F#
            [92.499, 184.997, 369.994, 739.989, 1479.978, 2959.955], // Gb
            [97.999, 195.998, 391.995, 783.991, 1567.982, 3135.963], // G
            [103.826, 207.652, 415.305, 830.609, 1661.219, 3322.438], // G#
            [103.826, 207.652, 415.305, 830.609, 1661.219, 3322.438] // Ab
        ];

        return note_array[note[0]][note[1]+1];
    }

    this.audioletApp = new AudioletApp();
};
