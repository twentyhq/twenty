import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

// The subset of the hook's recording closure the listeners act on. Every
// resource belongs to this object, so a late event from an old recording
// can never release a newer recording's resources.
type MediaRecorderLifecycleRecording = {
  mediaType: 'audio' | 'video';
  mediaRecorder: MediaRecorder;
  recordedChunks: Blob[];
  heldBlob: Blob | null;
  pendingStopResolve: ((recordedBlob: Blob | null) => void) | null;
  hasStopHandlerRun: boolean;
  wasCancelled: boolean;
  hasRecorderErrored: boolean;
  finalDurationSeconds: number;
  startedAt: number;
};

type AttachMediaRecorderLifecycleListenersParams<
  TRecording extends MediaRecorderLifecycleRecording,
> = {
  recording: TRecording;
  isDisposed: () => boolean;
  releaseRecordingResources: (recording: TRecording) => void;
};

export const attachMediaRecorderLifecycleListeners = <
  TRecording extends MediaRecorderLifecycleRecording,
>({
  recording,
  isDisposed,
  releaseRecordingResources,
}: AttachMediaRecorderLifecycleListenersParams<TRecording>): void => {
  const { mediaRecorder } = recording;

  mediaRecorder.addEventListener('dataavailable', (event) => {
    if (event.data.size > 0) {
      recording.recordedChunks.push(event.data);
    }
  });

  // Without this a recorder failure would leave the device open and the
  // application's stop call hanging on a recording that can never end.
  mediaRecorder.addEventListener('error', () => {
    recording.hasRecorderErrored = true;

    if (mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    } else if (!recording.hasStopHandlerRun) {
      releaseRecordingResources(recording);
      recording.pendingStopResolve?.(null);
    }
  });

  mediaRecorder.addEventListener('stop', () => {
    // The single point where the recording ends, whichever path stopped it
    // (application stop, host indicator, max duration, track ending).
    recording.hasStopHandlerRun = true;
    recording.finalDurationSeconds = Math.max(
      1,
      Math.round((Date.now() - recording.startedAt) / 1000),
    );

    releaseRecordingResources(recording);

    if (isDisposed() || recording.wasCancelled || recording.hasRecorderErrored) {
      // Dropping the chunks matters: they alone pin the discarded
      // recording's bytes (tens of MB for video).
      recording.recordedChunks = [];
      recording.pendingStopResolve?.(null);

      return;
    }

    const recordedBlob = new Blob(recording.recordedChunks, {
      type: isNonEmptyString(mediaRecorder.mimeType)
        ? mediaRecorder.mimeType
        : `${recording.mediaType}/webm`,
    });

    recording.recordedChunks = [];

    if (isDefined(recording.pendingStopResolve)) {
      recording.pendingStopResolve(recordedBlob);
    } else {
      // Stopped without an awaiting stop call (max duration): hold the blob
      // so the application's later stop can still upload it.
      recording.heldBlob = recordedBlob;
    }
  });
};
