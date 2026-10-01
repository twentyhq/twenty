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
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useToast } from 'twenty-ui/components';

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
  const { enqueueToast } = useToast();

  const { isIOS } = useMemo(() => readDictationSurface(), []);

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const createdEngine = createWebSpeechDictationEngine({
      isIOS,
      // Read imperatively so a language change doesn't rebuild the engine; the next session picks it up.
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

  // Separate so fresh handler identities re-subscribe without tearing down a live recording.
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
          if (event.state === 'idle') {
            onInterimText('');
          }
          break;
        case 'error':
          // iOS only: elsewhere one missed start (cold speech service) would hide the button for the origin's life.
          if (event.reason === 'engine-silent' && isIOS) {
            setHasWebSpeechProvenSilent(true);
          }
          enqueueToast({
            variant: 'error',
            children: getDictationFailureMessage(event.reason),
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
    enqueueToast,
  ]);

  // Both send paths dispatch this, so dictation needn't be lifted into the composer.
  const handleSendMessage = useCallback(() => {
    dictationEngine?.cancel();
  }, [dictationEngine]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  return null;
};
