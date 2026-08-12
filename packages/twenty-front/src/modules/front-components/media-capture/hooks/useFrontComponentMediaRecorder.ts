import { useEffect, useRef, useState } from 'react';
import {
  type CaptureMediaFailureReason,
  type CaptureMediaMediaType,
} from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';

import { mapMediaCaptureErrorToFailureReason } from '@/front-components/media-capture/utils/mapMediaCaptureErrorToFailureReason';
import { pickSupportedMediaRecorderMimeType } from '@/front-components/media-capture/utils/pickSupportedMediaRecorderMimeType';

export type StartRecordingResult =
  | { outcome: 'started' }
  // The capture settled (e.g. cancelled) while the permission prompt was
  // open; the acquired stream has been stopped and must not be used.
  | { outcome: 'abandoned' }
  | { outcome: 'failed'; reason: CaptureMediaFailureReason };

type UseFrontComponentMediaRecorderParams = {
  mediaType: CaptureMediaMediaType;
  maxDurationSeconds: number;
  isCaptureSettled: () => boolean;
  onRecordingReady: () => void;
  onRecorderError: () => void;
};

// Owns the imperative getUserMedia / MediaRecorder lifecycle so the capture
// modal only renders. All handles live in refs shared with recorder event
// listeners; they never drive rendering themselves.
export const useFrontComponentMediaRecorder = ({
  mediaType,
  maxDurationSeconds,
  isCaptureSettled,
  onRecordingReady,
  onRecorderError,
}: UseFrontComponentMediaRecorderParams) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // oxlint-disable-next-line twenty/no-state-useref
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const recordedChunksRef = useRef<Blob[]>([]);
  // oxlint-disable-next-line twenty/no-state-useref
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  // oxlint-disable-next-line twenty/no-state-useref
  const recordingStartedAtRef = useRef<number>(0);
  // oxlint-disable-next-line twenty/no-state-useref
  const finalDurationSecondsRef = useRef<number>(0);
  // Guarded through a ref: state updates are async, so a second click during
  // the permission prompt would otherwise start a second stream and orphan
  // the first one with the microphone still live.
  // oxlint-disable-next-line twenty/no-state-useref
  const isStartingRecordingRef = useRef(false);
  // oxlint-disable-next-line twenty/no-state-useref
  const isDisposedRef = useRef(false);

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const clearElapsedInterval = () => {
    if (isDefined(elapsedIntervalRef.current)) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  };

  const releaseRecorderResources = () => {
    clearElapsedInterval();

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    stopMediaStream();
  };

  // Revoking through an effect keeps a single source of truth for the blob
  // url: replacement, discard, and unmount all release the previous url.
  useEffect(() => {
    if (!isDefined(recordedBlobUrl)) {
      return;
    }

    return () => URL.revokeObjectURL(recordedBlobUrl);
  }, [recordedBlobUrl]);

  useEffect(() => {
    // Reset on setup so StrictMode's simulated unmount cannot permanently
    // mark the hook disposed in development.
    isDisposedRef.current = false;

    return () => {
      isDisposedRef.current = true;
      releaseRecorderResources();
    };
    // Cleanup only touches refs, so mount-scoped registration is safe.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopRecording = () => {
    clearElapsedInterval();

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const startRecording = async (): Promise<StartRecordingResult> => {
    if (isStartingRecordingRef.current || isCaptureSettled()) {
      return { outcome: 'abandoned' };
    }
    isStartingRecordingRef.current = true;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        mediaType === 'audio' ? { audio: true } : { audio: true, video: true },
      );

      // The capture may have been cancelled — or the modal unmounted by an
      // external close — while the permission prompt was open; adopting the
      // stream now would leave the device recording.
      if (isDisposedRef.current || isCaptureSettled()) {
        mediaStream.getTracks().forEach((track) => track.stop());

        return { outcome: 'abandoned' };
      }

      stopMediaStream();
      mediaStreamRef.current = mediaStream;

      const preferredMimeType = pickSupportedMediaRecorderMimeType({
        mediaType,
        isMimeTypeSupported: (mimeType) =>
          MediaRecorder.isTypeSupported(mimeType),
      });

      const mediaRecorder = new MediaRecorder(
        mediaStream,
        isDefined(preferredMimeType)
          ? { mimeType: preferredMimeType }
          : undefined,
      );

      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      });

      // Without this a recorder failure would strand the capture request:
      // no preview is reached and the worker promise never settles.
      mediaRecorder.addEventListener('error', () => onRecorderError());

      mediaRecorder.addEventListener('stop', () => {
        // The single point where a recording ends, whichever path stopped it
        // (stop button, max duration, or a track ending on its own).
        finalDurationSecondsRef.current = Math.max(
          1,
          Math.round((Date.now() - recordingStartedAtRef.current) / 1000),
        );

        clearElapsedInterval();
        stopMediaStream();

        if (isCaptureSettled()) {
          return;
        }

        const blob = new Blob(recordedChunksRef.current, {
          type: mediaRecorder.mimeType || `${mediaType}/webm`,
        });

        setRecordedBlob(blob);
        setRecordedBlobUrl(URL.createObjectURL(blob));
        onRecordingReady();
      });

      recordingStartedAtRef.current = Date.now();
      finalDurationSecondsRef.current = 0;
      setElapsedSeconds(0);

      // A one second timeslice bounds how much recording is lost if the
      // recorder errors mid-way, without flooding the chunk list.
      mediaRecorder.start(1000);

      // Elapsed time derives from Date.now(), so a one second tick cannot
      // drift and matches the granularity of both the display and the cap.
      elapsedIntervalRef.current = setInterval(() => {
        const nextElapsedSeconds = Math.floor(
          (Date.now() - recordingStartedAtRef.current) / 1000,
        );

        setElapsedSeconds(nextElapsedSeconds);

        if (nextElapsedSeconds >= maxDurationSeconds) {
          stopRecording();
        }
      }, 1000);

      return { outcome: 'started' };
    } catch (error) {
      stopMediaStream();

      return {
        outcome: 'failed',
        reason: mapMediaCaptureErrorToFailureReason(error),
      };
    } finally {
      isStartingRecordingRef.current = false;
    }
  };

  const discardRecording = () => {
    // Dropping the chunks matters: they alone pin the discarded recording's
    // bytes (tens of MB for video) until the next recording starts.
    recordedChunksRef.current = [];
    setRecordedBlob(null);
    setRecordedBlobUrl(null);
  };

  // Callback ref: assigns the live stream to the preview element as soon as
  // it mounts, which only happens while a recording is running.
  const liveVideoPreviewRef = (element: HTMLVideoElement | null) => {
    if (isDefined(element) && isDefined(mediaStreamRef.current)) {
      element.srcObject = mediaStreamRef.current;
    }
  };

  return {
    elapsedSeconds,
    recordedBlob,
    recordedBlobUrl,
    liveVideoPreviewRef,
    startRecording,
    stopRecording,
    discardRecording,
    releaseRecorderResources,
    getRecordingDurationSeconds: () => finalDurationSecondsRef.current,
  };
};
