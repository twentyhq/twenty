import { useStore } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { createWebSpeechDictationEngine } from '@/ai/dictation/engines/createWebSpeechDictationEngine';
import { useDictationAvailability } from '@/ai/dictation/hooks/useDictationAvailability';
import { dictationEngineState } from '@/ai/dictation/states/dictationEngineState';
import { hasWebSpeechProvenSilentState } from '@/ai/dictation/states/hasWebSpeechProvenSilentState';
import { isDictationRecordingState } from '@/ai/dictation/states/isDictationRecordingState';
import { getDictationFailureMessage } from '@/ai/dictation/utils/getDictationFailureMessage';
import { getDictationLanguage } from '@/ai/dictation/utils/getDictationLanguage';
import { readDictationSurface } from '@/ai/dictation/utils/readDictationSurface';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type AiChatDictationEffectProps = {
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
};

export const AiChatDictationEffect = ({
  onInterimText,
  onFinalText,
}: AiChatDictationEffectProps) => {
  const isSupported = useDictationAvailability();
  const store = useStore();

  const [dictationEngine, setDictationEngine] =
    useAtomState(dictationEngineState);
  const setIsDictationRecording = useSetAtomState(isDictationRecordingState);
  const setHasWebSpeechProvenSilent = useSetAtomState(
    hasWebSpeechProvenSilentState,
  );
  const { enqueueErrorSnackBar } = useSnackBar();

  const { isIOS } = useMemo(() => readDictationSurface(), []);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const createdEngine = createWebSpeechDictationEngine({
      isIOS,
      // Read from the store rather than subscribed to, so a language change
      // neither re-renders this nor rebuilds the engine; the next session
      // picks it up.
      getLanguage: () =>
        getDictationLanguage(
          store.get(currentWorkspaceMemberState.atom)?.locale,
        ),
    });

    setDictationEngine(createdEngine);

    return () => {
      createdEngine.dispose();
      setDictationEngine(null);
    };
  }, [isSupported, isIOS, store, setDictationEngine]);

  // Separate from construction so fresh handler identities re-subscribe instead
  // of tearing down a live recording.
  useEffect(() => {
    if (!isDefined(dictationEngine)) {
      return;
    }

    return dictationEngine.subscribe((event) => {
      switch (event.type) {
        case 'interim':
          onInterimText(event.text);
          break;
        case 'final':
          onFinalText(event.text);
          break;
        case 'state':
          setIsDictationRecording(event.state === 'recording');
          // The session took its pending words with it, settled or not.
          if (event.state === 'idle') {
            onInterimText('');
          }
          break;
        case 'error':
          // Remembered only where a silent engine stays silent. A desktop
          // browser that missed one start — a cold speech service, a blip
          // reaching it — would otherwise lose the button for the life of the
          // origin, with clearing site data the only way back.
          if (event.reason === 'engine-silent' && isIOS) {
            setHasWebSpeechProvenSilent(true);
          }
          enqueueErrorSnackBar({
            message: getDictationFailureMessage(event.reason),
          });
          break;
      }
    });
  }, [
    dictationEngine,
    isIOS,
    onInterimText,
    onFinalText,
    setIsDictationRecording,
    setHasWebSpeechProvenSilent,
    enqueueErrorSnackBar,
  ]);

  // Both send paths dispatch this, so dictation does not have to be lifted into
  // the composer to be stopped by one.
  const handleSendMessage = useCallback(() => {
    dictationEngine?.cancel();
  }, [dictationEngine]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  return null;
};
