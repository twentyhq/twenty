import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DICTATION_READINESS_DELAY_IN_MS } from '@/ai/dictation/constants/DictationReadinessDelayInMs';
import { type DictationEngine } from '@/ai/dictation/types/DictationEngine';
import { type TranscribeDictationAudio } from '@/ai/dictation/types/DictationTranscriptionResult';
import { createDictationEventEmitter } from '@/ai/dictation/utils/createDictationEventEmitter';
import { mapMediaDeviceError } from '@/ai/dictation/utils/mapMediaDeviceError';
import { pickRecorderMimeType } from '@/ai/dictation/utils/pickRecorderMimeType';

export const createServerDictationEngine = ({
  transcribeAudio,
  maxDurationSeconds,
  language,
}: {
  transcribeAudio: TranscribeDictationAudio;
  maxDurationSeconds: number;
  language: string;
}): DictationEngine => {
  const emitter = createDictationEventEmitter();

  let mediaStream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let readinessTimer: ReturnType<typeof setTimeout> | null = null;
  let durationTimer: ReturnType<typeof setTimeout> | null = null;
  // getUserMedia resolves whenever the user answers the permission prompt, which
  // can be long after the composer unmounted. The generation is what stops that
  // late stream becoming a recorder nothing owns.
  let sessionGeneration = 0;
  let isDisposed = false;

  const clearTimers = () => {
    if (readinessTimer !== null) {
      clearTimeout(readinessTimer);
      readinessTimer = null;
    }

    if (durationTimer !== null) {
      clearTimeout(durationTimer);
      durationTimer = null;
    }
  };

  // Released as soon as recording ends rather than on dispose: an open
  // microphone leaves the browser's recording indicator lit.
  const releaseStream = () => {
    if (isDefined(mediaStream)) {
      for (const track of mediaStream.getTracks()) {
        track.stop();
      }

      mediaStream = null;
    }
  };

  const stopRecording = () => {
    sessionGeneration++;
    clearTimers();

    if (isDefined(mediaRecorder) && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();

      return;
    }

    releaseStream();
  };

  const handleRecordingStopped = async () => {
    const mimeType = mediaRecorder?.mimeType ?? '';

    releaseStream();
    mediaRecorder = null;

    // Uploading after disposal would bill for a transcript with no listener.
    if (isDisposed) {
      chunks = [];

      return;
    }

    const audio = new Blob(
      chunks,
      isNonEmptyString(mimeType) ? { type: mimeType } : undefined,
    );

    chunks = [];

    if (audio.size === 0) {
      emitter.emit({ type: 'state', state: 'idle' });

      return;
    }

    emitter.emit({ type: 'state', state: 'settling' });

    const result = await transcribeAudio(audio, language);

    if (result.status === 'failed') {
      emitter.emit({ type: 'error', reason: result.reason });
    } else if (isNonEmptyString(result.text)) {
      emitter.emit({ type: 'final', text: result.text });
    }

    emitter.emit({ type: 'state', state: 'idle' });
  };

  return {
    tier: 'cloud',

    start: async () => {
      if (isDefined(mediaRecorder)) {
        return;
      }

      const generation = ++sessionGeneration;

      emitter.emit({ type: 'state', state: 'starting' });

      let acquiredStream: MediaStream;

      try {
        acquiredStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
      } catch (error) {
        emitter.emit({ type: 'error', reason: mapMediaDeviceError(error) });
        emitter.emit({ type: 'state', state: 'idle' });

        return;
      }

      if (generation !== sessionGeneration) {
        for (const track of acquiredStream.getTracks()) {
          track.stop();
        }

        emitter.emit({ type: 'state', state: 'idle' });

        return;
      }

      mediaStream = acquiredStream;

      const mimeType = pickRecorderMimeType();

      try {
        mediaRecorder = new MediaRecorder(
          mediaStream,
          isDefined(mimeType) ? { mimeType } : undefined,
        );
      } catch {
        releaseStream();
        emitter.emit({ type: 'error', reason: 'engine-error' });
        emitter.emit({ type: 'state', state: 'idle' });

        return;
      }

      chunks = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        void handleRecordingStopped();
      });

      mediaRecorder.addEventListener('error', () => {
        clearTimers();
        releaseStream();
        // The spec says a stop event follows, but a browser that skips it would
        // leave the recorder set and every later start refused.
        mediaRecorder = null;
        emitter.emit({ type: 'error', reason: 'engine-error' });
        emitter.emit({ type: 'state', state: 'idle' });
      });

      mediaRecorder.start();

      readinessTimer = setTimeout(() => {
        readinessTimer = null;
        emitter.emit({ type: 'state', state: 'listening' });
      }, DICTATION_READINESS_DELAY_IN_MS);

      // The server rejects anything longer.
      durationTimer = setTimeout(() => {
        durationTimer = null;
        stopRecording();
      }, maxDurationSeconds * 1000);
    },

    stop: stopRecording,

    dispose: () => {
      sessionGeneration++;
      isDisposed = true;
      clearTimers();

      if (isDefined(mediaRecorder) && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }

      mediaRecorder = null;
      chunks = [];
      releaseStream();
      // Before the listeners go, so a caller holding interim text clears it.
      emitter.emit({ type: 'state', state: 'idle' });
      emitter.clear();
    },

    subscribe: emitter.subscribe,
  };
};
