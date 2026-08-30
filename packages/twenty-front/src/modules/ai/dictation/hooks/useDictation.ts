import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type DictationEngine,
  type DictationEngineState,
  type DictationFailureReason,
} from '@/ai/dictation/types/DictationEngine';
import { createWebSpeechDictationEngine } from '@/ai/dictation/engines/createWebSpeechDictationEngine';
import { useDictationAvailability } from '@/ai/dictation/hooks/useDictationAvailability';
import { getDictationLanguage } from '@/ai/dictation/utils/getDictationLanguage';
import { readDictationSurface } from '@/ai/dictation/utils/readDictationSurface';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { recordWebSpeechSilentFailure } from '@/ai/dictation/utils/webSpeechSilentFailureStorage';

type UseDictationProps = {
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
  onSessionEnd: () => void;
  onFailure: (reason: DictationFailureReason) => void;
};

export const useDictation = ({
  onInterimText,
  onFinalText,
  onSessionEnd,
  onFailure,
}: UseDictationProps) => {
  const availability = useDictationAvailability();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const language = getDictationLanguage(currentWorkspaceMember?.locale);

  const [engine, setEngine] = useState<DictationEngine | null>(null);
  const [engineState, setEngineState] = useState<DictationEngineState>('idle');
  // In state as well as storage so the control disappears the moment the engine
  // proves itself dead, without waiting for a remount.
  const [hasEngineSilentlyFailed, setHasEngineSilentlyFailed] = useState(false);

  const isSupported = availability.status === 'available';

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const createdEngine = createWebSpeechDictationEngine({
      isIOS: readDictationSurface().isIOS,
      language,
    });

    setEngine(createdEngine);

    return () => {
      createdEngine.dispose();
      setEngine(null);
      setEngineState('idle');
    };
  }, [isSupported, language]);

  // Separate from construction so fresh handler identities re-subscribe instead
  // of tearing down a live recording.
  useEffect(() => {
    if (!isDefined(engine)) {
      return;
    }

    return engine.subscribe((event) => {
      switch (event.type) {
        case 'interim':
          onInterimText(event.text);
          break;
        case 'final':
          onFinalText(event.text);
          break;
        case 'state':
          setEngineState(event.state);
          if (event.state === 'idle') {
            onSessionEnd();
          }
          break;
        case 'error':
          if (event.reason === 'engine-silent') {
            recordWebSpeechSilentFailure();
            setHasEngineSilentlyFailed(true);
          }
          onFailure(event.reason);
          break;
      }
    });
  }, [engine, onInterimText, onFinalText, onSessionEnd, onFailure]);

  const toggleDictation = useCallback(() => {
    if (!isDefined(engine)) {
      return;
    }

    if (engineState === 'idle') {
      void engine.start();

      return;
    }

    engine.stop();
  }, [engine, engineState]);

  // Both send paths dispatch this, so dictation does not have to be lifted into
  // the composer to be stopped by one.
  const handleSendMessage = useCallback(() => {
    engine?.cancel();
  }, [engine]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  return {
    engineState,
    isAvailable: isSupported && !hasEngineSilentlyFailed && isDefined(engine),
    isRecording: engineState === 'starting' || engineState === 'listening',
    toggleDictation,
  };
};
