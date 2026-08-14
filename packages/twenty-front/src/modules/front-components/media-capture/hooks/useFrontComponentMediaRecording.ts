import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';
import {
  type StartMediaRecordingParams,
  type StartMediaRecordingResult,
  type StopMediaRecordingResult,
} from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { frontComponentMediaRecordingState } from '@/front-components/media-capture/states/frontComponentMediaRecordingState';
import { attachMediaRecorderLifecycleListeners } from '@/front-components/media-capture/utils/attachMediaRecorderLifecycleListeners';
import { mapMediaCaptureErrorToFailureReason } from '@/front-components/media-capture/utils/mapMediaCaptureErrorToFailureReason';
import { pickSupportedMediaRecorderMimeType } from '@/front-components/media-capture/utils/pickSupportedMediaRecorderMimeType';
import { uploadRecordedMediaBlob } from '@/front-components/media-capture/utils/uploadRecordedMediaBlob';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

// One recording owned by one front component instance. Every resource the
// recording holds — stream, recorder, timeout, chunks — lives on this
// closure object, so a late event from an old recording can never release
// a newer recording's resources.
type ActiveMediaRecording = {
  recordingId: string;
  mediaType: StartMediaRecordingParams['mediaType'];
  fieldMetadataId: string;
  mediaStream: MediaStream;
  mediaRecorder: MediaRecorder;
  maxDurationTimeoutId: ReturnType<typeof setTimeout> | null;
  recordedChunks: Blob[];
  heldBlob: Blob | null;
  pendingStopResolve: ((recordedBlob: Blob | null) => void) | null;
  hasStopHandlerRun: boolean;
  wasCancelled: boolean;
  hasRecorderErrored: boolean;
  finalDurationSeconds: number;
  startedAt: number;
};

type UseFrontComponentMediaRecordingParams = {
  applicationId: string;
};

// Owns the imperative getUserMedia / MediaRecorder / upload pipeline the
// sandboxed worker cannot run itself. The application owns the recording UX;
// the host contributes only this pipeline and the recording indicator.
export const useFrontComponentMediaRecording = ({
  applicationId,
}: UseFrontComponentMediaRecordingParams) => {
  const store = useStore();
  const { uploadFile } = useDirectFileUpload();
  const setFrontComponentMediaRecording = useSetAtomState(
    frontComponentMediaRecordingState,
  );

  // oxlint-disable-next-line twenty/no-state-useref
  const activeRecordingRef = useRef<ActiveMediaRecording | null>(null);
  // Guarded through a ref: a second start during the permission prompt would
  // otherwise acquire a second stream and orphan the first one still live.
  // oxlint-disable-next-line twenty/no-state-useref
  const isStartingRecordingRef = useRef(false);
  // oxlint-disable-next-line twenty/no-state-useref
  const isDisposedRef = useRef(false);

  const clearRecordingIndicator = (recordingId: string) => {
    const currentRecording = store.get(frontComponentMediaRecordingState.atom);

    if (currentRecording?.recordingId === recordingId) {
      setFrontComponentMediaRecording(null);
    }
  };

  // Releases the recording's own resources only — never the shared refs of
  // whatever recording is active by the time this runs.
  const releaseRecordingResources = (recording: ActiveMediaRecording) => {
    if (isDefined(recording.maxDurationTimeoutId)) {
      clearTimeout(recording.maxDurationTimeoutId);
      recording.maxDurationTimeoutId = null;
    }

    recording.mediaStream.getTracks().forEach((track) => track.stop());
    clearRecordingIndicator(recording.recordingId);
  };

  const cancelActiveRecording = () => {
    const activeRecording = activeRecordingRef.current;

    if (!isDefined(activeRecording)) {
      return;
    }

    activeRecording.wasCancelled = true;
    activeRecording.heldBlob = null;
    activeRecording.recordedChunks = [];
    activeRecordingRef.current = null;

    if (activeRecording.mediaRecorder.state === 'recording') {
      activeRecording.mediaRecorder.stop();
    }

    releaseRecordingResources(activeRecording);
  };

  useEffect(() => {
    // Reset on setup so StrictMode's simulated unmount cannot permanently
    // mark the hook disposed in development.
    isDisposedRef.current = false;

    return () => {
      // A destroyed front component must never leave a device recording.
      isDisposedRef.current = true;
      cancelActiveRecording();
    };
    // Cleanup only touches refs, so mount-scoped registration is safe.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startMediaRecording = async (
    params: StartMediaRecordingParams & { maxDurationSeconds: number },
  ): Promise<StartMediaRecordingResult> => {
    if (
      isStartingRecordingRef.current ||
      isDefined(activeRecordingRef.current) ||
      isDefined(store.get(frontComponentMediaRecordingState.atom))
    ) {
      return { status: 'failed', reason: 'busy' };
    }

    // getUserMedia only exists in secure contexts; fail before touching it.
    if (
      !window.isSecureContext ||
      !isDefined(navigator.mediaDevices?.getUserMedia)
    ) {
      return { status: 'failed', reason: 'blocked' };
    }

    isStartingRecordingRef.current = true;

    let recording: ActiveMediaRecording | null = null;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        params.mediaType === 'audio'
          ? { audio: true }
          : { audio: true, video: true },
      );

      // The component may have been destroyed while the permission prompt
      // was open; adopting the stream now would leave the device recording.
      if (isDisposedRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());

        return { status: 'failed', reason: 'unknown' };
      }

      const preferredMimeType = pickSupportedMediaRecorderMimeType({
        mediaType: params.mediaType,
        isMimeTypeSupported: (mimeType) =>
          MediaRecorder.isTypeSupported(mimeType),
      });

      const mediaRecorder = new MediaRecorder(
        mediaStream,
        isDefined(preferredMimeType)
          ? { mimeType: preferredMimeType }
          : undefined,
      );

      const startedRecording: ActiveMediaRecording = {
        recordingId: v4(),
        mediaType: params.mediaType,
        fieldMetadataId: params.fieldMetadataId,
        mediaStream,
        mediaRecorder,
        maxDurationTimeoutId: null,
        recordedChunks: [],
        heldBlob: null,
        pendingStopResolve: null,
        hasStopHandlerRun: false,
        wasCancelled: false,
        hasRecorderErrored: false,
        finalDurationSeconds: 0,
        startedAt: Date.now(),
      };

      recording = startedRecording;
      activeRecordingRef.current = startedRecording;

      attachMediaRecorderLifecycleListeners({
        recording: startedRecording,
        isDisposed: () => isDisposedRef.current,
        releaseRecordingResources,
      });

      // A one second timeslice bounds how much recording is lost if the
      // recorder errors mid-way, without flooding the chunk list.
      mediaRecorder.start(1000);

      // The ceiling stops the device, not the flow: the blob is held until
      // the application calls stop, which uploads it as usual.
      startedRecording.maxDurationTimeoutId = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, params.maxDurationSeconds * 1000);

      setFrontComponentMediaRecording({
        recordingId: startedRecording.recordingId,
        applicationId,
        mediaType: params.mediaType,
        startedAt: startedRecording.startedAt,
        requestCancel: cancelActiveRecording,
        getLiveMediaStream: () => startedRecording.mediaStream,
      });

      return { status: 'started', recordingId: startedRecording.recordingId };
    } catch (error) {
      // Recorder setup can fail after the recording was registered; leaving
      // it active would keep this component busy until unmount.
      if (isDefined(recording)) {
        releaseRecordingResources(recording);

        if (activeRecordingRef.current === recording) {
          activeRecordingRef.current = null;
        }
      }

      return {
        status: 'failed',
        reason: mapMediaCaptureErrorToFailureReason(error),
      };
    } finally {
      isStartingRecordingRef.current = false;
    }
  };

  const stopMediaRecording = async (params: {
    recordingId: string;
  }): Promise<StopMediaRecordingResult> => {
    const activeRecording = activeRecordingRef.current;

    // A stale id and a host-cancelled recording look the same to the
    // application: the recording is gone and nothing was uploaded.
    if (
      !isDefined(activeRecording) ||
      activeRecording.recordingId !== params.recordingId ||
      activeRecording.wasCancelled
    ) {
      return { status: 'cancelled' };
    }

    let recordedBlob = activeRecording.heldBlob;

    // Await the stop event even when the recorder is already inactive: the
    // max-duration ceiling stops it asynchronously, and the blob only exists
    // once the stop handler has run. Not after a recorder error though — an
    // inactive errored recorder fires no further stop event, so waiting for
    // one would hang this call forever.
    if (
      !isDefined(recordedBlob) &&
      !activeRecording.hasStopHandlerRun &&
      !activeRecording.hasRecorderErrored
    ) {
      recordedBlob = await new Promise<Blob | null>((resolve) => {
        activeRecording.pendingStopResolve = resolve;

        if (activeRecording.mediaRecorder.state === 'recording') {
          activeRecording.mediaRecorder.stop();
        }
      });
    }

    activeRecordingRef.current = null;
    activeRecording.heldBlob = null;

    if (activeRecording.hasRecorderErrored) {
      return { status: 'failed', reason: 'unknown' };
    }

    if (!isDefined(recordedBlob)) {
      return { status: 'cancelled' };
    }

    return await uploadRecordedMediaBlob({
      recordedBlob,
      mediaType: activeRecording.mediaType,
      fieldMetadataId: activeRecording.fieldMetadataId,
      durationSeconds: activeRecording.finalDurationSeconds,
      uploadFile,
    });
  };

  const cancelMediaRecording = async (params: {
    recordingId: string;
  }): Promise<void> => {
    if (activeRecordingRef.current?.recordingId !== params.recordingId) {
      return;
    }

    cancelActiveRecording();
  };

  return { startMediaRecording, stopMediaRecording, cancelMediaRecording };
};
