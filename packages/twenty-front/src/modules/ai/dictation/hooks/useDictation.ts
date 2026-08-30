import { useCallback, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import {
  type DictationEngine,
  type DictationEngineState,
  type DictationFailureReason,
  type DictationTier,
} from '@/ai/dictation/types/DictationEngine';
import { createServerDictationEngine } from '@/ai/dictation/engines/createServerDictationEngine';
import { createWebSpeechDictationEngine } from '@/ai/dictation/engines/createWebSpeechDictationEngine';
import { useDictationAvailability } from '@/ai/dictation/hooks/useDictationAvailability';
import { useTranscribeAudio } from '@/ai/dictation/hooks/useTranscribeAudio';
import { readDictationSurface } from '@/ai/dictation/utils/readDictationSurface';
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
  const { availability, maxDurationSeconds } = useDictationAvailability();
  const transcribeAudio = useTranscribeAudio();

  const [engine, setEngine] = useState<DictationEngine | null>(null);
  const [engineState, setEngineState] = useState<DictationEngineState>('idle');
  // Held in state as well as in storage so the control disappears the moment
  // the engine proves itself dead, without waiting for a remount to re-read it.
  const [hasEngineSilentlyFailed, setHasEngineSilentlyFailed] = useState(false);

  const tier: DictationTier | null =
    availability.status === 'available' ? availability.tier : null;

  useEffect(() => {
    if (!isDefined(tier)) {
      return;
    }

    const createdEngine =
      tier === 'cloud'
        ? createServerDictationEngine({ transcribeAudio, maxDurationSeconds })
        : createWebSpeechDictationEngine({
            isIOS: readDictationSurface().isIOS,
            language: navigator.language,
          });

    setEngine(createdEngine);

    return () => {
      createdEngine.dispose();
      setEngine(null);
      setEngineState('idle');
    };
  }, [tier, transcribeAudio, maxDurationSeconds]);

  // Subscription is separate from construction so that a caller passing fresh
  // handler identities re-subscribes instead of tearing down a live recording.
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

    // Settling means the recording is already being transcribed; stopping again
    // would only discard a result the user is waiting for.
    if (engineState !== 'settling') {
      engine.stop();
    }
  }, [engine, engineState]);

  return {
    tier,
    engineState,
    isAvailable:
      availability.status === 'available' &&
      !hasEngineSilentlyFailed &&
      isDefined(engine),
    isRecording: engineState === 'starting' || engineState === 'listening',
    isSettling: engineState === 'settling',
    toggleDictation,
  };
};
