import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DICTATION_LIVENESS_TIMEOUT_IN_MS } from '@/ai/dictation/constants/DictationLivenessTimeoutInMs';
import { type DictationEngine } from '@/ai/dictation/types/DictationEngine';
import { type DictationFailureReason } from '@/ai/dictation/types/DictationFailureReason';
import { type WebSpeechRecognitionErrorEvent } from '@/ai/dictation/types/WebSpeechRecognitionErrorEvent';
import { type WebSpeechRecognitionEvent } from '@/ai/dictation/types/WebSpeechRecognitionEvent';
import { type WebSpeechRecognitionInstance } from '@/ai/dictation/types/WebSpeechRecognitionInstance';
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
  getLanguage,
}: {
  isIOS: boolean;
  getLanguage: () => string;
}): DictationEngine => {
  const emitter = createDictationEventEmitter();

  // Reused: re-instantiating per press causes the iOS system chime and first-attempt failures.
  let recognition: WebSpeechRecognitionInstance | null = null;
  let isActive = false;
  // start() throws InvalidStateError until the recognizer reports its session ended, even after stop().
  let isRecognizerRunning = false;
  // Lets a startup resuming after the microphone warm-up notice a stop issued meanwhile.
  let sessionGeneration = 0;

  const watchdog = createLivenessWatchdog({
    timeoutInMs: DICTATION_LIVENESS_TIMEOUT_IN_MS,
    onSilent: () => {
      emitter.emit({ type: 'error', reason: 'engine-silent' });
      stopRecognition();
    },
  });

  // An abandoned recognizer must not report into the session that replaces it.
  const discardRecognition = () => {
    if (isDefined(recognition)) {
      recognition.onaudiostart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    }

    recognition = null;
    isRecognizerRunning = false;
  };

  // Every ending funnels here, without trusting onend: iOS can end a session without firing it.
  const endSession = ({
    evenWhenIdle = false,
  }: { evenWhenIdle?: boolean } = {}) => {
    if (!isActive && !evenWhenIdle) {
      return;
    }

    isActive = false;
    watchdog.disarm();
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    emitter.emit({ type: 'state', state: 'idle' });
  };

  // Tells the recognizer even when the session reads as over: after stop() it can still deliver a final result.
  // onend/onerror call endSession directly: bumping the generation there would abandon a warming start.
  const requestSessionEnd = (
    recognitionAction: 'stop' | 'abort',
    { evenWhenIdle = false }: { evenWhenIdle?: boolean } = {},
  ) => {
    sessionGeneration++;

    // A no-op on a recognizer that is not running.
    if (isDefined(recognition)) {
      recognition[recognitionAction]();
    }

    endSession({ evenWhenIdle });
  };

  const stopRecognition = () => {
    requestSessionEnd('stop');
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

    // Continuous mode never releases the iOS microphone and never delivers a result.
    instance.continuous = !isIOS;
    instance.interimResults = true;

    instance.onaudiostart = () => {
      watchdog.noteActivity();
    };

    instance.onresult = (event: WebSpeechRecognitionEvent) => {
      watchdog.noteActivity();

      const { finalText, interimText } = readTranscripts(event);

      if (isNonEmptyString(finalText)) {
        emitter.emit({ type: 'final', text: finalText });
      }

      // Emitted even when empty: the settling result carries no interim, so the hint would keep showing settled words.
      emitter.emit({ type: 'interim', text: interimText });
    };

    instance.onerror = (event: WebSpeechRecognitionErrorEvent) => {
      const reason = mapSpeechRecognitionError(event.error);

      if (isDefined(reason)) {
        emitter.emit({ type: 'error', reason });
      }

      // WebKit can skip the end the spec fires after an error; only onend clears isRecognizerRunning.
      endSession();
    };

    instance.onend = () => {
      isRecognizerRunning = false;
      endSession();
    };

    return instance;
  };

  const abandonStartup = (reason?: DictationFailureReason) => {
    if (isDefined(reason)) {
      emitter.emit({ type: 'error', reason });
    }

    emitter.emit({ type: 'state', state: 'idle' });
  };

  return {
    start: async () => {
      if (isActive) {
        return;
      }

      const generation = ++sessionGeneration;
      const isAbandoned = () => generation !== sessionGeneration;

      emitter.emit({ type: 'state', state: 'recording' });

      try {
        await warmUpMicrophone();
      } catch (error) {
        abandonStartup(mapMediaDeviceError(error));

        return;
      }

      if (isAbandoned()) {
        abandonStartup();

        return;
      }

      // iOS suspends contexts created outside a gesture, blocking recognition's capture path.
      if (isIOS) {
        await unlockAudioContext();

        if (isAbandoned()) {
          abandonStartup();

          return;
        }
      }

      if (isRecognizerRunning) {
        discardRecognition();
      }

      recognition = recognition ?? buildRecognition();

      if (!isDefined(recognition)) {
        abandonStartup('unsupported-surface');

        return;
      }

      // Per session: the API reads lang at start(), so a language change needs no engine rebuild.
      recognition.lang = getLanguage();

      isActive = true;
      document.addEventListener('visibilitychange', handleVisibilityChange);
      watchdog.arm();

      try {
        recognition.start();
      } catch {
        emitter.emit({ type: 'error', reason: 'engine-error' });
        endSession();

        return;
      }

      isRecognizerRunning = true;
    },

    stop: stopRecognition,

    // abort(), unlike stop(), delivers no result, so a half-heard utterance can't land in the draft after a send.
    cancel: () => {
      requestSessionEnd('abort');
    },

    dispose: () => {
      // Disposal must release the recognizer and clear interim text whether or not a session was live.
      requestSessionEnd('abort', { evenWhenIdle: true });
      discardRecognition();
      emitter.clear();
    },

    subscribe: emitter.subscribe,
  };
};
