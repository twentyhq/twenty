import { useCallback, useEffect, useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type DictationEngine,
  type DictationEngineState,
  type DictationFailureReason,
} from '@/ai/dictation/types/DictationEngine';
import { createWebSpeechDictationEngine } from '@/ai/dictation/engines/createWebSpeechDictationEngine';
import { useDictationAvailability } from '@/ai/dictation/hooks/useDictationAvailability';
import { hasWebSpeechProvenSilentState } from '@/ai/dictation/states/hasWebSpeechProvenSilentState';
import { getDictationLanguage } from '@/ai/dictation/utils/getDictationLanguage';
import { readDictationSurface } from '@/ai/dictation/utils/readDictationSurface';
import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type UseDictationProps = {
  onInterimText: (text: string) => void;
  onFinalText: (text: string) => void;
  onFailure: (reason: DictationFailureReason) => void;
};

export const useDictation = ({
  onInterimText,
  onFinalText,
  onFailure,
}: UseDictationProps) => {
  const isSupported = useDictationAvailability();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const language = getDictationLanguage(currentWorkspaceMember?.locale);
  const setHasWebSpeechProvenSilent = useSetAtomState(
    hasWebSpeechProvenSilentState,
  );

  const { isIOS } = useMemo(() => readDictationSurface(), []);

  const [engine, setEngine] = useState<DictationEngine | null>(null);
  const [engineState, setEngineState] = useState<DictationEngineState>('idle');

  useEffect(() => {
    if (!isSupported) {
      return;
    }

    const createdEngine = createWebSpeechDictationEngine({ isIOS, language });

    setEngine(createdEngine);

    return () => {
      createdEngine.dispose();
      setEngine(null);
    };
  }, [isSupported, isIOS, language]);

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
          onFailure(event.reason);
          break;
      }
    });
  }, [
    engine,
    isIOS,
    onInterimText,
    onFinalText,
    onFailure,
    setHasWebSpeechProvenSilent,
  ]);

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
    isAvailable: isSupported && isDefined(engine),
    isRecording: engineState === 'recording',
    toggleDictation,
  };
};
