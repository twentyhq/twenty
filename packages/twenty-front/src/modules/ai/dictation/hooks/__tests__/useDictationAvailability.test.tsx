import { act, renderHook } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import { useDictationAvailability } from '@/ai/dictation/hooks/useDictationAvailability';
import { hasWebSpeechProvenSilentState } from '@/ai/dictation/states/hasWebSpeechProvenSilentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const renderAvailability = () =>
  renderHook(() => ({
    isAvailable: useDictationAvailability(),
    setHasWebSpeechProvenSilent: useSetAtomState(hasWebSpeechProvenSilentState),
  }));

describe('useDictationAvailability', () => {
  beforeEach(() => {
    localStorage.clear();
    getDefaultStore().set(hasWebSpeechProvenSilentState.atom, false);
    Object.defineProperty(window, 'SpeechRecognition', {
      value: function SpeechRecognition() {},
      configurable: true,
    });
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
    Reflect.deleteProperty(window, 'SpeechRecognition');
  });

  it('offers dictation on a browser with a speech engine', () => {
    const { result } = renderAvailability();

    expect(result.current.isAvailable).toBe(true);
  });

  it('refuses when the browser has no speech engine', () => {
    Reflect.deleteProperty(window, 'SpeechRecognition');

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
