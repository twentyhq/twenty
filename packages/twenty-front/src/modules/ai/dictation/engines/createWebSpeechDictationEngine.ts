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

  // Reused for the engine's lifetime: re-instantiating per press produces the
  // iOS system chime and the first-attempt failures.
  let recognition: WebSpeechRecognitionInstance | null = null;
  let isActive = false;
  let readinessTimer: ReturnType<typeof setTimeout> | null = null;
  // A stop issued during the microphone warm-up has nothing to stop yet, so the
  // generation is what lets the resumed startup notice it was abandoned.
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

    // Not left to onend: iOS can end a session without firing it, and an
    // isActive left true would refuse every later start for the life of the
    // page. Deliberately not done in onerror, where a non-terminal error like
    // no-speech can arrive while the session is still running.
    isActive = false;
  };

  const handleVisibilityChange = () => {
    // A session that survives backgrounding on iOS only recovers on reload.
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
    // result.
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

      // Emitted even when empty: the result that settles an utterance carries
      // no interim for it, so the hint would keep showing words that are
      // already in the document.
      emitter.emit({ type: 'interim', text: interimText });
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

    // A send takes the composer's content with it, so a half-heard utterance
    // belongs to neither the sent message nor the next draft. abort() ends the
    // session without delivering a result, unlike stop().
    cancel: () => {
      sessionGeneration++;
      clearReadinessTimer();
      watchdog.disarm();

      if (isDefined(recognition)) {
        recognition.abort();
      }

      isActive = false;
    },

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
      // Before the listeners go, so a caller holding interim text clears it.
      emitter.emit({ type: 'state', state: 'idle' });
      emitter.clear();
    },

    subscribe: emitter.subscribe,
  };
};
