import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FrontComponentMediaRecordingTimerEffect } from '@/front-components/media-capture/components/FrontComponentMediaRecordingTimerEffect';
import { frontComponentMediaRecordingState } from '@/front-components/media-capture/states/frontComponentMediaRecordingState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FindOneApplicationNameDocument } from '~/generated-metadata/graphql';
import { formatDurationTimestamp } from '~/utils/format/formatDurationTimestamp';

// Host chrome the application cannot spoof or remove: whenever a device is
// live it names the recording application and offers a stop that discards.
const StyledIndicatorContainer = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  bottom: ${themeCssVariables.spacing[4]};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  position: fixed;
  right: ${themeCssVariables.spacing[4]};
  z-index: 1000;
`;

const StyledRecordingDot = styled.div`
  background-color: ${themeCssVariables.color.red};
  border-radius: 50%;
  height: 10px;
  width: 10px;
`;

const StyledRecordingLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledTimer = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-variant-numeric: tabular-nums;
`;

const StyledStopButton = styled.button`
  background-color: transparent;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledLiveVideoPreview = styled.video`
  border-radius: ${themeCssVariables.border.radius.sm};
  height: 36px;
  width: 48px;
`;

export const FrontComponentMediaRecordingIndicator = () => {
  const { t } = useLingui();
  const frontComponentMediaRecording = useAtomStateValue(
    frontComponentMediaRecordingState,
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { data: applicationNameData } = useQuery(
    FindOneApplicationNameDocument,
    {
      variables: { id: mediaRecording?.applicationId ?? '' },
      skip: !isDefined(mediaRecording),
    },
  );
  const applicationName = applicationNameData?.findOneApplication?.name;

  if (!isDefined(mediaRecording)) {
    return null;
  }

  const isAudioRecording = mediaRecording.mediaType === 'audio';

  const recordingLabel = isAudioRecording
    ? isNonEmptyString(applicationName)
      ? t`${applicationName} is recording audio`
      : t`An application is recording audio`
    : isNonEmptyString(applicationName)
      ? t`${applicationName} is recording video`
      : t`An application is recording video`;

  // Callback ref: binds the live stream once the element mounts, which only
  // happens while a recording is running.
  const liveVideoPreviewRef = (element: HTMLVideoElement | null) => {
    const liveMediaStream = mediaRecording.getLiveMediaStream();

    if (isDefined(element) && isDefined(liveMediaStream)) {
      element.srcObject = liveMediaStream;
    }
  };

  return (
    <StyledIndicatorContainer data-testid="media-recording-indicator">
      <FrontComponentMediaRecordingTimerEffect
        startedAt={mediaRecording.startedAt}
        onElapsedSecondsChange={setElapsedSeconds}
      />
      <StyledRecordingDot />
      {!isAudioRecording && (
        <StyledLiveVideoPreview
          ref={liveVideoPreviewRef}
          autoPlay
          muted
          playsInline
        />
      )}
      <StyledRecordingLabel>{recordingLabel}</StyledRecordingLabel>
      <StyledTimer>{formatDurationTimestamp(elapsedSeconds)}</StyledTimer>
      <StyledStopButton
        data-testid="media-recording-indicator-stop-button"
        onClick={mediaRecording.requestCancel}
      >
        {t`Stop`}
      </StyledStopButton>
    </StyledIndicatorContainer>
  );
};
