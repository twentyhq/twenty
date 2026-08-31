import { act, render } from '@testing-library/react';
import { getDefaultStore } from 'jotai';

import { AiChatDictationEffect } from '@/ai/dictation/components/AiChatDictationEffect';
import { dictationEngineState } from '@/ai/dictation/states/dictationEngineState';
import { hasWebSpeechProvenSilentState } from '@/ai/dictation/states/hasWebSpeechProvenSilentState';
import { type WebSpeechRecognitionConstructor } from '@/ai/dictation/types/WebSpeechRecognitionConstructor';

type SpeechRecognitionTestWindow = {
  SpeechRecognition?: WebSpeechRecognitionConstructor;
};

jest.mock('@/ui/feedback/snack-bar-manager/hooks/useSnackBar', () => ({
  useSnackBar: () => ({ enqueueErrorSnackBar: jest.fn() }),
}));

const renderEffect = () =>
  render(
    <AiChatDictationEffect onInterimText={jest.fn()} onFinalText={jest.fn()} />,
  );

const readEngine = () => getDefaultStore().get(dictationEngineState.atom);

describe('AiChatDictationEffect', () => {
  beforeEach(() => {
    localStorage.clear();
    getDefaultStore().set(hasWebSpeechProvenSilentState.atom, false);
    (window as SpeechRecognitionTestWindow).SpeechRecognition =
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
    delete (window as SpeechRecognitionTestWindow).SpeechRecognition;
    act(() => {
      getDefaultStore().set(dictationEngineState.atom, null);
    });
  });

  // The control renders on the engine's presence, so publishing it is what
  // makes dictation appear at all.
  it('publishes an engine on a surface that can dictate', () => {
    renderEffect();

    expect(readEngine()).not.toBeNull();
  });

  it('withdraws the engine when it unmounts', () => {
    const { unmount } = renderEffect();

    unmount();

    expect(readEngine()).toBeNull();
  });

  it('publishes no engine on a browser with no speech recognition', () => {
    delete (window as SpeechRecognitionTestWindow).SpeechRecognition;

    renderEffect();

    expect(readEngine()).toBeNull();
  });
});
