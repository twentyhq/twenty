import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DICTATION_LIVENESS_TIMEOUT_IN_MS } from '@/ai-chat/dictation/constants/DictationLivenessTimeoutInMs';
import { type DictationEngine } from '@/ai-chat/dictation/types/DictationEngine';
import { type DictationFailureReason } from '@/ai-chat/dictation/types/DictationFailureReason';
import { type WebSpeechRecognitionErrorEvent } from '@/ai-chat/dictation/types/WebSpeechRecognitionErrorEvent';
import { type WebSpeechRecognitionEvent } from '@/ai-chat/dictation/types/WebSpeechRecognitionEvent';
import { type WebSpeechRecognitionInstance } from '@/ai-chat/dictation/types/WebSpeechRecognitionInstance';
import { createDictationEventEmitter } from '@/ai-chat/dictation/utils/createDictationEventEmitter';
import { createLivenessWatchdog } from '@/ai-chat/dictation/utils/createLivenessWatchdog';
import { getSpeechRecognitionConstructor } from '@/ai-chat/dictation/utils/getSpeechRecognitionConstructor';
import { mapMediaDeviceError } from '@/ai-chat/dictation/utils/mapMediaDeviceError';
import { mapSpeechRecognitionError } from '@/ai-chat/dictation/utils/mapSpeechRecognitionError';
import { unlockAudioContext } from '@/ai-chat/dictation/utils/unlockAudioContext';
import { warmUpMicrophone } from '@/ai-chat/dictation/utils/warmUpMicrophone';

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

  let recognition: WebSpeechRecognitionInstance | null = null;
  let isActive = false;
  let isRecognizerRunning = false;
  let sessionGeneration = 0;

  const watchdog = createLivenessWatchdog({
    timeoutInMs: DICTATION_LIVENESS_TIMEOUT_IN_MS,
    onSilent: () => {
      emitter.emit({ type: 'error', reason: 'engine-silent' });
      stopRecognition();
    },
  });

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

  const requestSessionEnd = (
    recognitionAction: 'stop' | 'abort',
    { evenWhenIdle = false }: { evenWhenIdle?: boolean } = {},
  ) => {
    sessionGeneration++;

    if (isDefined(recognition)) {
      recognition[recognitionAction]();
    }

    endSession({ evenWhenIdle });
  };

  const stopRecognition = () => {
    requestSessionEnd('stop');
  };

  const handleVisibilityChange = () => {
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

      emitter.emit({ type: 'interim', text: interimText });
    };

    instance.onerror = (event: WebSpeechRecognitionErrorEvent) => {
      const reason = mapSpeechRecognitionError(event.error);

      if (isDefined(reason)) {
        emitter.emit({ type: 'error', reason });
      }

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

    cancel: () => {
      requestSessionEnd('abort');
    },

    dispose: () => {
      requestSessionEnd('abort', { evenWhenIdle: true });
      discardRecognition();
      emitter.clear();
    },

    subscribe: emitter.subscribe,
  };
};
