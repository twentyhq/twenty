import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useRef, useState } from 'react';
import { type CaptureMediaResult } from 'twenty-front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { H1Title, H1TitleFontColor } from 'twenty-ui/typography';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FRONT_COMPONENT_MEDIA_CAPTURE_MODAL_INSTANCE_ID } from '@/front-components/media-capture/constants/FrontComponentMediaCaptureModalInstanceId';
import { useFrontComponentMediaRecorder } from '@/front-components/media-capture/hooks/useFrontComponentMediaRecorder';
import { type FrontComponentMediaCaptureRequest } from '@/front-components/media-capture/states/frontComponentMediaCaptureRequestState';
import { frontComponentMediaCaptureIsUploadingState } from '@/front-components/media-capture/states/frontComponentMediaCaptureIsUploadingState';
import { getMediaCaptureFileExtension } from '@/front-components/media-capture/utils/getMediaCaptureFileExtension';
import { useDirectFileUpload } from '@/file/hooks/useDirectFileUpload';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  StyledCenteredButton,
  StyledCenteredTitle,
  StyledSectionContainer,
} from '@/ui/layout/modal/components/ConfirmationModal';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import {
  FileFolder,
  FindOneApplicationNameDocument,
} from '~/generated-metadata/graphql';
import { formatDurationTimestamp } from '~/utils/format/formatDurationTimestamp';

type FrontComponentMediaCaptureModalProps = {
  mediaCaptureRequest: FrontComponentMediaCaptureRequest;
  onResult: (result: CaptureMediaResult) => void;
};

type MediaCaptureStep = 'consent' | 'recording' | 'preview' | 'uploading';

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

  const { data: applicationNameData } = useQuery(
    FindOneApplicationNameDocument,
    { variables: { id: mediaCaptureRequest.applicationId } },
  );
  const applicationName = applicationNameData?.findOneApplication?.name;

  const setFrontComponentMediaCaptureIsUploading = useSetAtomState(
    frontComponentMediaCaptureIsUploadingState,
  );

  const [step, setStep] = useState<MediaCaptureStep>('consent');

  // The capture result must be emitted exactly once: a cancel racing an
  // in-flight upload would otherwise resolve the same request twice.
  // oxlint-disable-next-line twenty/no-state-useref
  const hasEmittedResultRef = useRef(false);

  const isAudioCapture = mediaCaptureRequest.mediaType === 'audio';

  const {
    elapsedSeconds,
    recordedBlob,
    recordedBlobUrl,
    liveVideoPreviewRef,
    startRecording,
    stopRecording,
    discardRecording,
    releaseRecorderResources,
    getRecordingDurationSeconds,
  } = useFrontComponentMediaRecorder({
    mediaType: mediaCaptureRequest.mediaType,
    maxDurationSeconds: mediaCaptureRequest.maxDurationSeconds,
    isCaptureSettled: () => hasEmittedResultRef.current,
    onRecordingReady: () => setStep('preview'),
    onRecorderError: () => emitResult({ status: 'failed', reason: 'unknown' }),
  });

  const emitResult = (result: CaptureMediaResult) => {
    if (hasEmittedResultRef.current) {
      return;
    }
    hasEmittedResultRef.current = true;

    releaseRecorderResources();
    onResult(result);
  };

  const handleStartRecording = async () => {
    const startResult = await startRecording();

    if (startResult.outcome === 'started') {
      setStep('recording');
    }

    if (startResult.outcome === 'failed') {
      emitResult({ status: 'failed', reason: startResult.reason });
    }
  };

  const handleRecordAgain = () => {
    discardRecording();
    setStep('consent');
  };

  const handleUseRecording = async () => {
    if (!isDefined(recordedBlob)) {
      return;
    }

    setStep('uploading');
    // Shields the request from the external-close effect: past this point a
    // closed modal must not resolve 'cancelled' under an in-flight upload,
    // or the uploaded file would be stranded with no reference holder.
    setFrontComponentMediaCaptureIsUploading(true);

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${mediaCaptureRequest.mediaType}-recording-${timestamp}.${getMediaCaptureFileExtension(recordedBlob.type)}`;

      const recordedFile = new File([recordedBlob], filename, {
        type: recordedBlob.type,
      });

      const uploadedFile = await uploadFile(recordedFile, {
        fileFolder: FileFolder.FilesField,
        fieldMetadataId: mediaCaptureRequest.fieldMetadataId,
      });

      emitResult({
        status: 'captured',
        file: {
          fileId: uploadedFile.id,
          path: uploadedFile.path,
          url: uploadedFile.url,
          size: uploadedFile.size,
          mimeType: recordedBlob.type.split(';')[0],
          durationSeconds: getRecordingDurationSeconds(),
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

  // Full sentences per variant: composing "<name> is asking…" from fragments
  // would break in languages that inflect around the subject.
  const consentText = isAudioCapture
    ? isNonEmptyString(applicationName)
      ? t`${applicationName} is asking to record audio with your microphone. Recording starts only after you click Start recording, and you review the result before it is shared.`
      : t`An application in this workspace is asking to record audio with your microphone. Recording starts only after you click Start recording, and you review the result before it is shared.`
    : isNonEmptyString(applicationName)
      ? t`${applicationName} is asking to record video with your camera and microphone. Recording starts only after you click Start recording, and you review the result before it is shared.`
      : t`An application in this workspace is asking to record video with your camera and microphone. Recording starts only after you click Start recording, and you review the result before it is shared.`;

  const cancelButton = (
    <StyledCenteredButton
      onClick={handleCancel}
      variant="secondary"
      title={t`Cancel`}
      fullWidth
      justify="center"
      dataTestId="media-capture-modal-cancel-button"
    />
  );

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
          {cancelButton}
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
              {formatDurationTimestamp(elapsedSeconds)} /{' '}
              {formatDurationTimestamp(mediaCaptureRequest.maxDurationSeconds)}
            </StyledTimer>
          </StyledRecordingRow>
          {cancelButton}
          <StyledCenteredButton
            onClick={stopRecording}
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
                {cancelButton}
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
              title={step === 'uploading' ? t`Uploading...` : t`Use recording`}
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
