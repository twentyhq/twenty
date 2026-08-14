import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FrontComponentMediaSessionTimerEffect } from '@/front-components/media-session/components/FrontComponentMediaSessionTimerEffect';
import { RootStackingContextZIndices } from '@/ui/layout/constants/RootStackingContextZIndices';
import { frontComponentMediaSessionState } from '@/front-components/media-session/states/frontComponentMediaSessionState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FindOneApplicationNameDocument } from '~/generated-metadata/graphql';
import { formatDurationTimestamp } from '~/utils/format/formatDurationTimestamp';

// Host chrome the application cannot spoof or remove: whenever a device is
// live it names the recording application and offers a stop that ends the
// capture tracks.
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
  z-index: ${RootStackingContextZIndices.MediaRecordingIndicator};
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
  const frontComponentMediaSession = useAtomStateValue(
    frontComponentMediaSessionState,
  );

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const { data: applicationNameData } = useQuery(
    FindOneApplicationNameDocument,
    {
      variables: { id: frontComponentMediaSession?.applicationId ?? '' },
      skip: !isDefined(frontComponentMediaSession),
    },
  );
  const applicationName = applicationNameData?.findOneApplication?.name;

  if (!isDefined(frontComponentMediaSession)) {
    return null;
  }

  const isAudioSession = frontComponentMediaSession.mediaType === 'audio';

  const recordingLabel = isAudioSession
    ? isNonEmptyString(applicationName)
      ? t`${applicationName} is recording audio`
      : t`An application is recording audio`
    : isNonEmptyString(applicationName)
      ? t`${applicationName} is recording video`
      : t`An application is recording video`;

  // Callback ref: binds the live stream once the element mounts, which only
  // happens while a capture session is running.
  const liveVideoPreviewRef = (element: HTMLVideoElement | null) => {
    const liveMediaStream = frontComponentMediaSession.getLiveMediaStream();

    if (isDefined(element) && isDefined(liveMediaStream)) {
      element.srcObject = liveMediaStream;
    }
  };

  return (
    <StyledIndicatorContainer data-testid="media-recording-indicator">
      <FrontComponentMediaSessionTimerEffect
        startedAt={frontComponentMediaSession.startedAt}
        onElapsedSecondsChange={setElapsedSeconds}
      />
      <StyledRecordingDot />
      {!isAudioSession && (
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
        onClick={frontComponentMediaSession.requestStop}
      >
        {t`Stop`}
      </StyledStopButton>
    </StyledIndicatorContainer>
  );
};
