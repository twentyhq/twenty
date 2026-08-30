import { renderHook } from '@testing-library/react';

import { useDictationAvailability } from '@/ai/dictation/hooks/useDictationAvailability';
import { type WebSpeechRecognitionConstructor } from '@/ai/dictation/types/WebSpeechRecognition';
import { recordWebSpeechSilentFailure } from '@/ai/dictation/utils/webSpeechSilentFailureStorage';

type SpeechRecognitionTestWindow = {
  SpeechRecognition?: WebSpeechRecognitionConstructor;
};

describe('useDictationAvailability', () => {
  beforeEach(() => {
    localStorage.clear();
    // SpeechRecognition is absent from the DOM lib because it never became a
    // standard, so the global is reached through the same structural type the
    // engine declares.
    (window as unknown as SpeechRecognitionTestWindow).SpeechRecognition =
      function SpeechRecognition() {} as unknown as WebSpeechRecognitionConstructor;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: jest.fn() },
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });
  });

  afterEach(() => {
    delete (window as unknown as SpeechRecognitionTestWindow).SpeechRecognition;
  });

  it('offers dictation on a browser with a speech engine', () => {
    const { result } = renderHook(() => useDictationAvailability());

    expect(result.current).toEqual({ status: 'available' });
  });

  it('refuses when the browser has no speech engine', () => {
    delete (window as unknown as SpeechRecognitionTestWindow).SpeechRecognition;

    const { result } = renderHook(() => useDictationAvailability());

    expect(result.current).toEqual({
      status: 'unavailable',
      reason: 'unsupported-surface',
    });
  });

  // Offering the same dead button again only costs the user another recording.
  it('refuses a browser whose speech engine already proved silent', () => {
    recordWebSpeechSilentFailure();

    const { result } = renderHook(() => useDictationAvailability());

    expect(result.current).toEqual({
      status: 'unavailable',
      reason: 'engine-silent',
    });
  });
});
