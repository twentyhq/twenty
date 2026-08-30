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

  // Reused for the engine's lifetime: re-instantiating per press produces the
  // iOS system chime and the first-attempt failures.
  let recognition: WebSpeechRecognitionInstance | null = null;
  let isActive = false;
  // The recognizer's own started flag outlives the session the UI sees: stop()
  // and abort() only release it when the recognizer reports the session ended,
  // and start() throws InvalidStateError until then.
  let isRecognizerRunning = false;
  // A stop issued during the microphone warm-up has nothing to stop yet, so the
  // generation is what lets the resumed startup notice it was abandoned.
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

  // Announces that the session is over and undoes what start() set up. Every
  // ending funnels through here so it cannot drift between callers and cannot
  // run twice, and onend is
  // deliberately not trusted to arrive — iOS can end a session without firing
  // it, and leaving any of this to it wedges dictation. A stuck isActive
  // refuses every later start, a state left at 'recording' leaves the button
  // offering to stop a session that is already over, and a listener outliving
  // its session calls back into a stopped engine.
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

  // Asked to end the session, rather than told it ended. The recognizer is told
  // even when the session already reads as over: stop() clears isActive eagerly
  // but the recognizer can still be settling and deliver one last final result,
  // so a cancel arriving in that window has to abort it — otherwise that text
  // lands in a composer the send just cleared. Ending a session that was never
  // told to stop (onend, onerror) must not bump the generation, or a recognizer
  // reporting a previous session would abandon the start already warming up.
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

    // Continuous mode never releases the iOS microphone and never delivers a
    // result.
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

      // Emitted even when empty: the result that settles an utterance carries
      // no interim for it, so the hint would keep showing words that are
      // already in the document.
      emitter.emit({ type: 'interim', text: interimText });
    };

    instance.onerror = (event: WebSpeechRecognitionErrorEvent) => {
      const reason = mapSpeechRecognitionError(event.error);

      if (isDefined(reason)) {
        emitter.emit({ type: 'error', reason });
      }

      // An error terminates the session — the spec fires end after it — but the
      // WebKit surfaces this engine is written around can skip that, and waiting
      // for it would leave the button offering to stop a session that is over.
      // isRecognizerRunning deliberately stays set: only onend proves the
      // recognizer released itself, so the next start replaces it instead.
      endSession();
    };

    instance.onend = () => {
      isRecognizerRunning = false;
      endSession();
    };

    return instance;
  };

  // A press that never reached the recognizer still has to return the button to
  // idle, and there is nothing yet to tear down when it does.
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

      // iOS only: a context created outside a user gesture is suspended there,
      // and a suspended one blocks the capture path recognition runs on.
      // Everywhere else it is a create/resume/close the press pays for nothing.
      if (isIOS) {
        await unlockAudioContext();

        if (isAbandoned()) {
          abandonStartup();

          return;
        }
      }

      // A recognizer that never reported its session ended cannot be started
      // again, so a press inside that window gets a fresh one rather than an
      // InvalidStateError.
      if (isRecognizerRunning) {
        discardRecognition();
      }

      recognition = recognition ?? buildRecognition();

      if (!isDefined(recognition)) {
        abandonStartup('unsupported-surface');

        return;
      }

      // Read per session rather than per engine: the API takes lang at start(),
      // so a speaker who changes their language does not need the engine torn
      // down and rebuilt — and a session in flight is not aborted to apply it.
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

    // A send takes the composer's content with it, so a half-heard utterance
    // belongs to neither the sent message nor the next draft. abort() ends the
    // session without delivering a result, unlike stop().
    cancel: () => {
      requestSessionEnd('abort');
    },

    dispose: () => {
      // evenWhenIdle because disposal has to release the recognizer and let a
      // caller holding interim text clear it whether or not a session was live.
      requestSessionEnd('abort', { evenWhenIdle: true });
      discardRecognition();
      emitter.clear();
    },

    subscribe: emitter.subscribe,
  };
};
