import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import { useDictationAvailability } from '@/ai/dictation/hooks/useDictationAvailability';
import { hasWebSpeechProvenSilentState } from '@/ai/dictation/states/hasWebSpeechProvenSilentState';
import { type WebSpeechRecognitionConstructor } from '@/ai/dictation/types/WebSpeechRecognitionConstructor';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type SpeechRecognitionTestWindow = {
  SpeechRecognition?: WebSpeechRecognitionConstructor;
};

const renderAvailability = () =>
  renderHook(() => ({
    isAvailable: useDictationAvailability(),
    setHasWebSpeechProvenSilent: useSetAtomState(hasWebSpeechProvenSilentState),
  }));

describe('useDictationAvailability', () => {
  beforeEach(() => {
    localStorage.clear();
    getDefaultStore().set(hasWebSpeechProvenSilentState.atom, false);
    // SpeechRecognition isn't in the DOM lib, so reach it through the engine's structural type.
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
    const { result } = renderAvailability();

    expect(result.current.isAvailable).toBe(true);
  });

  it('refuses when the browser has no speech engine', () => {
    delete (window as unknown as SpeechRecognitionTestWindow).SpeechRecognition;

    const { result } = renderAvailability();

    expect(result.current.isAvailable).toBe(false);
  });

  it('withdraws dictation the moment the engine proves itself silent', () => {
    const { result } = renderAvailability();

    act(() => {
      result.current.setHasWebSpeechProvenSilent(true);
    });

    expect(result.current.isAvailable).toBe(false);
  });
});
