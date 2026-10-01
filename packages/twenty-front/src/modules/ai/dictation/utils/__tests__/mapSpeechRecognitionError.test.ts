import { mapSpeechRecognitionError } from '@/ai/dictation/utils/mapSpeechRecognitionError';

describe('mapSpeechRecognitionError', () => {
  it.each([
    ['not-allowed', 'permission-denied'],
    ['service-not-allowed', 'permission-denied'],
    ['audio-capture', 'no-device'],
    ['network', 'network'],
    ['language-not-supported', 'engine-error'],
  ])('maps %s to %s', (error, expected) => {
    expect(mapSpeechRecognitionError(error)).toBe(expected);
  });

  it.each(['aborted', 'no-speech'])('treats %s as a normal ending', (error) => {
    expect(mapSpeechRecognitionError(error)).toBeUndefined();
  });
});
