import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useRef, useState } from 'react';
import { type CaptureMediaResult } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID } from '@/front-components/media-capture/constants/FrontComponentMediaCaptureModalInstanceId';
import { type FrontComponentMediaCaptureRequest } from '@/front-components/media-capture/states/frontComponentMediaCaptureRequestState';
import { formatSecondsAsTimer } from '@/front-components/media-capture/utils/formatSecondsAsTimer';
import { getMediaCaptureFileExtension } from '@/front-components/media-capture/utils/getMediaCaptureFileExtension';
import { mapMediaCaptureErrorToFailureReason } from '@/front-components/media-capture/utils/mapMediaCaptureErrorToFailureReason';
import { pickSupportedMediaRecorderMimeType } from '@/front-components/media-capture/utils/pickSupportedMediaRecorderMimeType';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { StyledCenteredButton } from '@/ui/layout/modal/components/ConfirmationModal';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { FileFolder } from '~/generated-metadata/graphql';

type FrontComponentMediaCaptureModalProps = {
  mediaCaptureRequest: FrontComponentMediaCaptureRequest;
  onResult: (result: CaptureMediaResult) => void;
};

type MediaCaptureStep = 'consent' | 'recording' | 'preview' | 'uploading';

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSectionContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledRecordingRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  margin-bottom: ${themeCssVariables.spacing[6]};
`;

const StyledRecordingDot = styled.div`
  background-color: ${themeCssVariables.color.red};
  border-radius: 50%;
  height: 10px;
  width: 10px;
`;

const StyledTimer = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-variant-numeric: tabular-nums;
`;

const StyledVideoPreview = styled.video`
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.md};
  display: block;
  margin-bottom: ${themeCssVariables.spacing[4]};
  max-height: 240px;
  width: 100%;
`;

const StyledAudioPreview = styled.audio`
  display: block;
  margin-bottom: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

export const FrontComponentMediaCaptureModal = ({
  mediaCaptureRequest,
  onResult,
}: FrontComponentMediaCaptureModalProps) => {
  const { t } = useLingui();
  const { uploadFile } = useDirectFileUpload();

  const [step, setStep] = useState<MediaCaptureStep>('consent');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // The refs below hold imperative recording handles and bookkeeping shared
  // with MediaRecorder listeners; they never drive rendering.
  // oxlint-disable-next-line twenty/no-state-useref
  const mediaStreamRef = useRef<MediaStream | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const recordedChunksRef = useRef<Blob[]>([]);
  // oxlint-disable-next-line twenty/no-state-useref
  const recordedBlobUrlRef = useRef<string | null>(null);
  // oxlint-disable-next-line twenty/no-state-useref
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  // oxlint-disable-next-line twenty/no-state-useref
  const recordingStartedAtRef = useRef<number>(0);
  // oxlint-disable-next-line twenty/no-state-useref
  const finalDurationSecondsRef = useRef<number>(0);
  // oxlint-disable-next-line twenty/no-state-useref
  const hasEmittedResultRef = useRef(false);
  // oxlint-disable-next-line twenty/no-state-useref
  const isStartingRecordingRef = useRef(false);
  // oxlint-disable-next-line twenty/no-state-useref
  const liveVideoPreviewRef = useRef<HTMLVideoElement | null>(null);

  const isAudioCapture = mediaCaptureRequest.mediaType === 'audio';

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

  const revokeRecordedBlobUrl = () => {
    if (isDefined(recordedBlobUrlRef.current)) {
      URL.revokeObjectURL(recordedBlobUrlRef.current);
      recordedBlobUrlRef.current = null;
    }
  };

  // The capture result must be emitted exactly once: a cancel racing an
  // in-flight upload would otherwise resolve the same request twice.
  const emitResult = (result: CaptureMediaResult) => {
    if (hasEmittedResultRef.current) {
      return;
    }
    hasEmittedResultRef.current = true;

    clearElapsedInterval();

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    stopMediaStream();
    onResult(result);
  };

  useEffect(() => {
    return () => {
      clearElapsedInterval();

      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }

      stopMediaStream();
      revokeRecordedBlobUrl();
    };
    // Cleanup only touches refs, so mount-scoped registration is safe.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      step === 'recording' &&
      !isAudioCapture &&
      isDefined(liveVideoPreviewRef.current) &&
      isDefined(mediaStreamRef.current)
    ) {
      liveVideoPreviewRef.current.srcObject = mediaStreamRef.current;
    }
  }, [step, isAudioCapture]);

  const handleStopRecording = () => {
    finalDurationSecondsRef.current = Math.max(
      1,
      Math.round((Date.now() - recordingStartedAtRef.current) / 1000),
    );

    clearElapsedInterval();

    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleStartRecording = async () => {
    // Guarded through a ref: state updates are async, so a second click
    // during the permission prompt would otherwise start a second stream
    // and orphan the first one with the microphone still live.
    if (isStartingRecordingRef.current || hasEmittedResultRef.current) {
      return;
    }
    isStartingRecordingRef.current = true;

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        isAudioCapture ? { audio: true } : { audio: true, video: true },
      );

      // The request may have been cancelled while the permission prompt was
      // open; adopting the stream now would leave the device recording.
      if (hasEmittedResultRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop());

        return;
      }

      stopMediaStream();
      mediaStreamRef.current = mediaStream;

      const preferredMimeType = pickSupportedMediaRecorderMimeType(
        mediaCaptureRequest.mediaType,
        (mimeType) => MediaRecorder.isTypeSupported(mimeType),
      );

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
      // no 'preview' step is reached and the worker promise never settles.
      mediaRecorder.addEventListener('error', () => {
        clearElapsedInterval();
        stopMediaStream();
        emitResult({ status: 'failed', reason: 'unknown' });
      });

      mediaRecorder.addEventListener('stop', () => {
        stopMediaStream();
        clearElapsedInterval();

        if (hasEmittedResultRef.current) {
          return;
        }

        const blobMimeType =
          mediaRecorder.mimeType ||
          (isAudioCapture ? 'audio/webm' : 'video/webm');
        const blob = new Blob(recordedChunksRef.current, {
          type: blobMimeType,
        });

        revokeRecordedBlobUrl();
        const blobUrl = URL.createObjectURL(blob);
        recordedBlobUrlRef.current = blobUrl;

        setRecordedBlob(blob);
        setRecordedBlobUrl(blobUrl);
        setStep('preview');
      });

      recordingStartedAtRef.current = Date.now();
      finalDurationSecondsRef.current = 0;
      setElapsedSeconds(0);

      // A one second timeslice bounds how much recording is lost if the
      // recorder errors mid-way, without flooding the chunk list.
      mediaRecorder.start(1000);

      elapsedIntervalRef.current = setInterval(() => {
        const nextElapsedSeconds = Math.floor(
          (Date.now() - recordingStartedAtRef.current) / 1000,
        );

        setElapsedSeconds(nextElapsedSeconds);

        if (nextElapsedSeconds >= mediaCaptureRequest.maxDurationSeconds) {
          handleStopRecording();
        }
      }, 250);

      setStep('recording');
    } catch (error) {
      stopMediaStream();
      emitResult({
        status: 'failed',
        reason: mapMediaCaptureErrorToFailureReason(error),
      });
    } finally {
      isStartingRecordingRef.current = false;
    }
  };

  const handleRecordAgain = () => {
    revokeRecordedBlobUrl();
    setRecordedBlob(null);
    setRecordedBlobUrl(null);
    setStep('consent');
  };

  const handleUseRecording = async () => {
    if (!isDefined(recordedBlob)) {
      return;
    }

    setStep('uploading');

    try {
      const mimeType =
        recordedBlob.type.split(';')[0] ||
        (isAudioCapture ? 'audio/webm' : 'video/webm');
      const fileExtension = getMediaCaptureFileExtension(recordedBlob.type);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${mediaCaptureRequest.mediaType}-recording-${timestamp}.${fileExtension}`;

      const recordedFile = new File([recordedBlob], filename, {
        type: recordedBlob.type,
      });

      const uploadedFile = await uploadFile(recordedFile, {
        fileFolder: isDefined(mediaCaptureRequest.fieldMetadataId)
          ? FileFolder.FilesField
          : FileFolder.MediaCapture,
        fieldMetadataId: mediaCaptureRequest.fieldMetadataId,
      });

      emitResult({
        status: 'captured',
        file: {
          fileId: uploadedFile.id,
          path: uploadedFile.path,
          url: uploadedFile.url,
          size: uploadedFile.size,
          mimeType,
          durationSeconds: finalDurationSecondsRef.current,
        },
      });
    } catch {
      emitResult({ status: 'failed', reason: 'upload-failed' });
    }
  };

  const handleCancel = () => {
    // The upload is past the point of no return; cancelling now would
    // resolve the request twice once the upload settles.
    if (step === 'uploading') {
      return;
    }

    emitResult({ status: 'cancelled' });
  };

  const title = isAudioCapture ? t`Record audio` : t`Record video`;

  const consentText = isAudioCapture
    ? t`An application in this workspace is asking to record audio with your microphone. Recording starts only after you click Start recording, and you review the result before it is shared.`
    : t`An application in this workspace is asking to record video with your camera and microphone. Recording starts only after you click Start recording, and you review the result before it is shared.`;

  return (
    <ModalStatefulWrapper
      modalInstanceId={FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID}
      onClose={handleCancel}
      isClosable={true}
      shouldCloseModalOnClickOutsideOrEscape={step !== 'uploading'}
      padding="large"
      overlay="dark"
      dataGloballyPreventClickOutside
      renderInDocumentBody
      smallBorderRadius
      narrowWidth
      autoHeight
    >
      <StyledCenteredTitle>
        <H1Title title={title} fontColor={H1TitleFontColor.Primary} />
      </StyledCenteredTitle>

      {step === 'consent' && (
        <>
          <StyledSectionContainer>
            <Section
              alignment={SectionAlignment.Center}
              fontColor={SectionFontColor.Primary}
            >
              {consentText}
            </Section>
          </StyledSectionContainer>
          <StyledCenteredButton
            onClick={handleCancel}
            variant="secondary"
            title={t`Cancel`}
            fullWidth
            justify="center"
            dataTestId="media-capture-modal-cancel-button"
          />
          <StyledCenteredButton
            onClick={handleStartRecording}
            variant="primary"
            accent="blue"
            title={t`Start recording`}
            fullWidth
            justify="center"
            dataTestId="media-capture-modal-start-button"
          />
        </>
      )}

      {step === 'recording' && (
        <>
          {!isAudioCapture && (
            <StyledVideoPreview
              ref={liveVideoPreviewRef}
              autoPlay
              muted
              playsInline
            />
          )}
          <StyledRecordingRow>
            <StyledRecordingDot />
            <StyledTimer>
              {formatSecondsAsTimer(elapsedSeconds)} /{' '}
              {formatSecondsAsTimer(mediaCaptureRequest.maxDurationSeconds)}
            </StyledTimer>
          </StyledRecordingRow>
          <StyledCenteredButton
            onClick={handleCancel}
            variant="secondary"
            title={t`Cancel`}
            fullWidth
            justify="center"
            dataTestId="media-capture-modal-cancel-button"
          />
          <StyledCenteredButton
            onClick={handleStopRecording}
            variant="primary"
            accent="danger"
            title={t`Stop recording`}
            fullWidth
            justify="center"
            dataTestId="media-capture-modal-stop-button"
          />
        </>
      )}

      {(step === 'preview' || step === 'uploading') &&
        isDefined(recordedBlobUrl) && (
          <>
            {isAudioCapture ? (
              <StyledAudioPreview controls src={recordedBlobUrl} />
            ) : (
              <StyledVideoPreview controls src={recordedBlobUrl} />
            )}
            {step === 'preview' && (
              <>
                <StyledCenteredButton
                  onClick={handleCancel}
                  variant="secondary"
                  title={t`Cancel`}
                  fullWidth
                  justify="center"
                  dataTestId="media-capture-modal-cancel-button"
                />
                <StyledCenteredButton
                  onClick={handleRecordAgain}
                  variant="secondary"
                  title={t`Record again`}
                  fullWidth
                  justify="center"
                  dataTestId="media-capture-modal-record-again-button"
                />
              </>
            )}
            <StyledCenteredButton
              onClick={handleUseRecording}
              variant="primary"
              accent="blue"
              title={step === 'uploading' ? t`Uploading…` : t`Use recording`}
              disabled={step === 'uploading'}
              fullWidth
              justify="center"
              dataTestId="media-capture-modal-use-button"
            />
          </>
        )}
    </ModalStatefulWrapper>
  );
};
