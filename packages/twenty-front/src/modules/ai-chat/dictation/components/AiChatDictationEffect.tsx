import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { type AiChatInstanceEventDetail } from '@/ai-chat/types/AiChatInstanceEventDetail';
import { useStore } from 'jotai';
import { useCallback, useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai-chat/constants/AiChatSendMessageEventName';
import { createWebSpeechDictationEngine } from '@/ai-chat/dictation/engines/createWebSpeechDictationEngine';
import { useDictationAvailability } from '@/ai-chat/dictation/hooks/useDictationAvailability';
import { dictationEngineComponentState } from '@/ai-chat/dictation/states/dictationEngineComponentState';
import { hasWebSpeechProvenSilentState } from '@/ai-chat/dictation/states/hasWebSpeechProvenSilentState';
import { isDictationRecordingComponentState } from '@/ai-chat/dictation/states/isDictationRecordingComponentState';
import { getDictationFailureMessage } from '@/ai-chat/dictation/utils/getDictationFailureMessage';
import { getDictationLanguage } from '@/ai-chat/dictation/utils/getDictationLanguage';
import { readDictationSurface } from '@/ai-chat/dictation/utils/readDictationSurface';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useToast } from 'twenty-ui/components/feedback';

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
  const { instanceId } = useAiChatInstanceOrThrow();

  const [dictationEngine, setDictationEngine] = useAtomComponentState(
    dictationEngineComponentState,
  );
  const setIsDictationRecording = useSetAtomComponentState(
    isDictationRecordingComponentState,
  );
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
            status: 'error',
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
  const handleSendMessage = useCallback(
    (detail?: AiChatInstanceEventDetail) => {
      if (detail?.instanceId === instanceId) {
        dictationEngine?.cancel();
      }
    },
    [instanceId, dictationEngine],
  );

  useListenToBrowserEvent<AiChatInstanceEventDetail>({
    eventName: AI_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  return null;
};
