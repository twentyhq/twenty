import { isNonEmptyString } from '@sniptt/guards';
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
import { getMediaCaptureFileExtension } from '@/front-components/media-capture/utils/getMediaCaptureFileExtension';
import { mapMediaCaptureErrorToFailureReason } from '@/front-components/media-capture/utils/mapMediaCaptureErrorToFailureReason';
import { pickSupportedMediaRecorderMimeType } from '@/front-components/media-capture/utils/pickSupportedMediaRecorderMimeType';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { FileFolder } from '~/generated-metadata/graphql';

// One recording owned by one front component instance. All recorder state
// lives in a per-recording closure so late recorder events can never touch
// a newer recording's state.
type ActiveMediaRecording = {
  recordingId: string;
  mediaType: StartMediaRecordingParams['mediaType'];
  fieldMetadataId: string;
  recordedChunks: Blob[];
  heldBlob: Blob | null;
  pendingStopResolve: ((blob: Blob | null) => void) | null;
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
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const activeRecordingRef = useRef<ActiveMediaRecording | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const maxDurationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  // Guarded through a ref: a second start during the permission prompt would
  // otherwise acquire a second stream and orphan the first one still live.
  // oxlint-disable-next-line twenty/no-state-useref
  const isStartingRecordingRef = useRef(false);
  // oxlint-disable-next-line twenty/no-state-useref
  const isDisposedRef = useRef(false);

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const clearMaxDurationTimeout = () => {
    if (isDefined(maxDurationTimeoutRef.current)) {
      clearTimeout(maxDurationTimeoutRef.current);
      maxDurationTimeoutRef.current = null;
    }
  };

  const clearRecordingIndicator = (recordingId: string) => {
    const currentRecording = store.get(frontComponentMediaRecordingState.atom);

    if (currentRecording?.recordingId === recordingId) {
      setFrontComponentMediaRecording(null);
    }
  };

  const cancelActiveRecording = () => {
    const activeRecording = activeRecordingRef.current;

    if (!isDefined(activeRecording)) {
      return;
    }

    activeRecording.wasCancelled = true;
    activeRecording.heldBlob = null;
    activeRecording.recordedChunks = [];

    clearMaxDurationTimeout();

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    stopMediaStream();
    clearRecordingIndicator(activeRecording.recordingId);
    activeRecordingRef.current = null;
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

      stopMediaStream();
      mediaStreamRef.current = mediaStream;

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

      const recording: ActiveMediaRecording = {
        recordingId: v4(),
        mediaType: params.mediaType,
        fieldMetadataId: params.fieldMetadataId,
        recordedChunks: [],
        heldBlob: null,
        pendingStopResolve: null,
        wasCancelled: false,
        hasRecorderErrored: false,
        finalDurationSeconds: 0,
        startedAt: Date.now(),
      };

      mediaRecorderRef.current = mediaRecorder;
      activeRecordingRef.current = recording;

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
        } else {
          stopMediaStream();
          clearRecordingIndicator(recording.recordingId);
          recording.pendingStopResolve?.(null);
        }
      });

      mediaRecorder.addEventListener('stop', () => {
        // The single point where the recording ends, whichever path stopped
        // it (application stop, host indicator, max duration, track ending).
        recording.finalDurationSeconds = Math.max(
          1,
          Math.round((Date.now() - recording.startedAt) / 1000),
        );

        clearMaxDurationTimeout();
        stopMediaStream();
        clearRecordingIndicator(recording.recordingId);

        if (
          isDisposedRef.current ||
          recording.wasCancelled ||
          recording.hasRecorderErrored
        ) {
          // Dropping the chunks matters: they alone pin the discarded
          // recording's bytes (tens of MB for video).
          recording.recordedChunks = [];
          recording.pendingStopResolve?.(null);

          return;
        }

        const recordedBlob = new Blob(recording.recordedChunks, {
          type: isNonEmptyString(mediaRecorder.mimeType)
            ? mediaRecorder.mimeType
            : `${params.mediaType}/webm`,
        });

        recording.recordedChunks = [];

        if (isDefined(recording.pendingStopResolve)) {
          recording.pendingStopResolve(recordedBlob);
        } else {
          // Stopped without an awaiting stop call (max duration): hold the
          // blob so the application's later stop can still upload it.
          recording.heldBlob = recordedBlob;
        }
      });

      // A one second timeslice bounds how much recording is lost if the
      // recorder errors mid-way, without flooding the chunk list.
      mediaRecorder.start(1000);

      // The ceiling stops the device, not the flow: the blob is held until
      // the application calls stop, which uploads it as usual.
      maxDurationTimeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, params.maxDurationSeconds * 1000);

      setFrontComponentMediaRecording({
        recordingId: recording.recordingId,
        applicationId,
        mediaType: params.mediaType,
        startedAt: recording.startedAt,
        requestCancel: cancelActiveRecording,
        getLiveMediaStream: () => mediaStreamRef.current,
      });

      return { status: 'started', recordingId: recording.recordingId };
    } catch (error) {
      stopMediaStream();

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

    if (
      !isDefined(recordedBlob) &&
      mediaRecorderRef.current?.state === 'recording'
    ) {
      recordedBlob = await new Promise<Blob | null>((resolve) => {
        activeRecording.pendingStopResolve = resolve;
        mediaRecorderRef.current?.stop();
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

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${activeRecording.mediaType}-recording-${timestamp}.${getMediaCaptureFileExtension(recordedBlob.type)}`;

      const recordedFile = new File([recordedBlob], filename, {
        type: recordedBlob.type,
      });

      const uploadedFile = await uploadFile(recordedFile, {
        fileFolder: FileFolder.FilesField,
        fieldMetadataId: activeRecording.fieldMetadataId,
      });

      return {
        status: 'captured',
        file: {
          fileId: uploadedFile.id,
          path: uploadedFile.path,
          url: uploadedFile.url,
          size: uploadedFile.size,
          mimeType: recordedBlob.type.split(';')[0],
          durationSeconds: activeRecording.finalDurationSeconds,
        },
      };
    } catch {
      return { status: 'failed', reason: 'upload-failed' };
    }
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
