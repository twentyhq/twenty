import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

import { useDictationAvailability } from '@/ai/dictation/hooks/useDictationAvailability';
import { type DictationConfig } from '@/client-config/types/DictationConfig';
import { dictationConfigState } from '@/client-config/states/dictationConfigState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const renderAvailability = (dictationConfig: DictationConfig) => {
  const { result } = renderHook(
    () => ({
      setDictationConfig: useSetAtomState(dictationConfigState),
      ...useDictationAvailability(),
    }),
    { wrapper },
  );

  act(() => {
    result.current.setDictationConfig(dictationConfig);
  });

  return result;
};

describe('useDictationAvailability', () => {
  beforeEach(() => {
    resetJotaiStore();
    localStorage.clear();
    window.SpeechRecognition =
      function SpeechRecognition() {} as unknown as typeof window.SpeechRecognition;
    window.MediaRecorder = function MediaRecorder() {} as never;
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: jest.fn() },
      configurable: true,
    });
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    });
  });

  it('offers the local engine when the server configured no provider', () => {
    const result = renderAvailability({ mode: 'local', maxDurationSeconds: 0 });

    expect(result.current.availability).toEqual({
      status: 'available',
      tier: 'local',
    });
  });

  it('offers the cloud engine and its recording cap', () => {
    const result = renderAvailability({
      mode: 'cloud',
      maxDurationSeconds: 120,
    });

    expect(result.current.availability).toEqual({
      status: 'available',
      tier: 'cloud',
    });
    expect(result.current.maxDurationSeconds).toBe(120);
  });

  it('reports nothing available when the instance disabled dictation', () => {
    const result = renderAvailability({
      mode: 'disabled',
      maxDurationSeconds: 0,
    });

    expect(result.current.availability).toEqual({ status: 'disabled' });
  });

  // Offering the same dead button again only costs the user another recording.
  it('stays unavailable in a browser whose speech engine already went silent', () => {
    localStorage.setItem('twenty:dictation:web-speech-silent', 'true');

    const result = renderAvailability({ mode: 'local', maxDurationSeconds: 0 });

    expect(result.current.availability).toEqual({
      status: 'unavailable',
      reason: 'engine-silent',
    });
  });

  // The remembered failure is about speech recognition, not about recording,
  // so it must not take dictation away from a workspace that has a provider.
  it('still offers the cloud engine after a remembered silent failure', () => {
    localStorage.setItem('twenty:dictation:web-speech-silent', 'true');

    const result = renderAvailability({
      mode: 'cloud',
      maxDurationSeconds: 120,
    });

    expect(result.current.availability).toEqual({
      status: 'available',
      tier: 'cloud',
    });
  });
});
