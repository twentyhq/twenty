import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DICTATION_LIVENESS_TIMEOUT_IN_MS } from '@/ai/dictation/constants/DictationLivenessTimeoutInMs';
import { DICTATION_READINESS_DELAY_IN_MS } from '@/ai/dictation/constants/DictationReadinessDelayInMs';
import { type DictationEngine } from '@/ai/dictation/types/DictationEngine';
import {
  type WebSpeechRecognitionErrorEvent,
  type WebSpeechRecognitionEvent,
  type WebSpeechRecognitionInstance,
} from '@/ai/dictation/types/WebSpeechRecognition';
import { createDictationEventEmitter } from '@/ai/dictation/utils/createDictationEventEmitter';
import { createLivenessWatchdog } from '@/ai/dictation/utils/createLivenessWatchdog';
import { getSpeechRecognitionConstructor } from '@/ai/dictation/utils/getSpeechRecognitionConstructor';
import { mapMediaDeviceError } from '@/ai/dictation/utils/mapMediaDeviceError';
import { mapSpeechRecognitionError } from '@/ai/dictation/utils/mapSpeechRecognitionError';
import { unlockAudioContext } from '@/ai/dictation/utils/unlockAudioContext';
import { warmUpMicrophone } from '@/ai/dictation/utils/warmUpMicrophone';

const readTranscripts = (event: WebSpeechRecognitionEvent) => {
  let finalText = '';
  let interimText = '';

  for (let index = event.resultIndex; index < event.results.length; index++) {
    const result = event.results[index];
    const transcript = result[0]?.transcript ?? '';

    if (result.isFinal) {
      finalText += transcript;
    } else {
      interimText += transcript;
    }
  }

  return { finalText, interimText };
};

export const createWebSpeechDictationEngine = ({
  isIOS,
  language,
}: {
  isIOS: boolean;
  language: string;
}): DictationEngine => {
  const emitter = createDictationEventEmitter();

  // Created once and reused for the lifetime of the engine. Re-instantiating
  // per press is what produces the iOS system chime and the first-attempt
  // failures, because each new instance restarts the audio stack.
  let recognition: WebSpeechRecognitionInstance | null = null;
  let isActive = false;
  let readinessTimer: ReturnType<typeof setTimeout> | null = null;
  // Bumped by every start, stop and dispose. Startup awaits the microphone
  // warm-up, and a stop issued during that wait has nothing to stop yet — the
  // generation is what lets the resumed startup notice it was abandoned
  // instead of opening the microphone after the user asked it not to.
  let sessionGeneration = 0;

  const clearReadinessTimer = () => {
    if (readinessTimer !== null) {
      clearTimeout(readinessTimer);
      readinessTimer = null;
    }
  };

  const watchdog = createLivenessWatchdog({
    timeoutInMs: DICTATION_LIVENESS_TIMEOUT_IN_MS,
    onSilent: () => {
      emitter.emit({ type: 'error', reason: 'engine-silent' });
      stopRecognition();
    },
  });

  const stopRecognition = () => {
    sessionGeneration++;
    clearReadinessTimer();
    watchdog.disarm();

    if (isActive && isDefined(recognition)) {
      recognition.stop();
    }
  };

  const handleVisibilityChange = () => {
    // A session that survives backgrounding on iOS comes back in a state
    // nothing but a reload recovers from, so it is ended instead.
    if (document.visibilityState === 'hidden') {
      stopRecognition();
    }
  };

  const buildRecognition = (): WebSpeechRecognitionInstance | null => {
    const SpeechRecognitionConstructor = getSpeechRecognitionConstructor();

    if (!isDefined(SpeechRecognitionConstructor)) {
      return null;
    }

    const instance = new SpeechRecognitionConstructor();

    // Continuous mode never releases the iOS microphone and never delivers a
    // result, so dictation there is one push-to-talk utterance at a time.
    instance.continuous = !isIOS;
    instance.interimResults = true;
    instance.lang = language;

    instance.onaudiostart = () => {
      watchdog.noteActivity();
    };

    instance.onresult = (event: WebSpeechRecognitionEvent) => {
      watchdog.noteActivity();

      const { finalText, interimText } = readTranscripts(event);

      if (isNonEmptyString(finalText)) {
        emitter.emit({ type: 'final', text: finalText });
      }

      if (isNonEmptyString(interimText)) {
        emitter.emit({ type: 'interim', text: interimText });
      }
    };

    instance.onerror = (event: WebSpeechRecognitionErrorEvent) => {
      watchdog.disarm();

      const reason = mapSpeechRecognitionError(event.error);

      if (isDefined(reason)) {
        emitter.emit({ type: 'error', reason });
      }
    };

    instance.onend = () => {
      isActive = false;
      clearReadinessTimer();
      watchdog.disarm();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      emitter.emit({ type: 'state', state: 'idle' });
    };

    return instance;
  };

  return {
    tier: 'local',

    start: async () => {
      if (isActive) {
        return;
      }

      const generation = ++sessionGeneration;
      const isAbandoned = () => generation !== sessionGeneration;

      emitter.emit({ type: 'state', state: 'starting' });

      try {
        await warmUpMicrophone();
      } catch (error) {
        emitter.emit({ type: 'error', reason: mapMediaDeviceError(error) });
        emitter.emit({ type: 'state', state: 'idle' });

        return;
      }

      if (isAbandoned()) {
        emitter.emit({ type: 'state', state: 'idle' });

        return;
      }

      await unlockAudioContext();

      if (isAbandoned()) {
        emitter.emit({ type: 'state', state: 'idle' });

        return;
      }

      recognition = recognition ?? buildRecognition();

      if (!isDefined(recognition)) {
        emitter.emit({ type: 'error', reason: 'unsupported-surface' });
        emitter.emit({ type: 'state', state: 'idle' });

        return;
      }

      isActive = true;
      document.addEventListener('visibilitychange', handleVisibilityChange);
      watchdog.arm();

      try {
        recognition.start();
      } catch {
        isActive = false;
        watchdog.disarm();
        document.removeEventListener(
          'visibilitychange',
          handleVisibilityChange,
        );
        emitter.emit({ type: 'error', reason: 'engine-error' });
        emitter.emit({ type: 'state', state: 'idle' });

        return;
      }

      readinessTimer = setTimeout(() => {
        readinessTimer = null;
        if (isActive) {
          emitter.emit({ type: 'state', state: 'listening' });
        }
      }, DICTATION_READINESS_DELAY_IN_MS);
    },

    stop: stopRecognition,

    dispose: () => {
      sessionGeneration++;
      clearReadinessTimer();
      watchdog.disarm();
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (isDefined(recognition)) {
        recognition.abort();
        recognition = null;
      }

      isActive = false;
      emitter.clear();
    },

    subscribe: emitter.subscribe,
  };
};
