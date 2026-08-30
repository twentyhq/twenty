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

  // Every path that ends a session funnels through here, so the teardown cannot
  // drift between them and cannot run twice. onend is deliberately not trusted
  // to arrive: iOS can end a session without firing it, and leaving any of this
  // to it wedges dictation — a stuck isActive refuses every later start, a state
  // left at 'listening' leaves the button offering to stop a session that is
  // already over, and a listener outliving its session calls back into a stopped
  // engine. The isActive guard makes a second call a no-op, which is what keeps
  // stop() from reporting idle twice once onend does arrive.
  const endSession = (
    recognitionAction: 'stop' | 'abort' | 'none',
    { evenWhenIdle = false }: { evenWhenIdle?: boolean } = {},
  ) => {
    // Outside the guard: a start whose microphone warm-up is still in flight has
    // not set isActive yet, and bumping the generation is what abandons it.
    sessionGeneration++;

    if (!isActive && !evenWhenIdle) {
      return;
    }

    isActive = false;
    clearReadinessTimer();
    watchdog.disarm();
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (isDefined(recognition)) {
      if (recognitionAction === 'abort') {
        recognition.abort();
      } else if (recognitionAction === 'stop') {
        recognition.stop();
      }
    }

    emitter.emit({ type: 'state', state: 'idle' });
  };

  const stopRecognition = () => {
    endSession('stop');
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
      endSession('none');
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
        emitter.emit({ type: 'error', reason: 'engine-error' });
        endSession('none');

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
      endSession('abort');
    },

    dispose: () => {
      // evenWhenIdle because disposal has to release the recognizer and let a
      // caller holding interim text clear it whether or not a session was live.
      endSession('abort', { evenWhenIdle: true });
      recognition = null;
      emitter.clear();
    },

    subscribe: emitter.subscribe,
  };
};
