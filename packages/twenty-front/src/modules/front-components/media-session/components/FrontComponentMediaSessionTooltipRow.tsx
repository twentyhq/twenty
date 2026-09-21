import { type FrontComponentMediaSessionStatus } from '@/front-components/media-session/types/FrontComponentMediaSessionStatus';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { IconMicrophone, IconVideo } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

type FrontComponentMediaSessionTooltipRowProps = {
  sessions: FrontComponentMediaSessionStatus[];
};

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDetails = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledApplicationName = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow-wrap: anywhere;
`;

const StyledMediaType = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

export const FrontComponentMediaSessionTooltipRow = ({
  sessions,
}: FrontComponentMediaSessionTooltipRowProps) => {
  const theme = useTheme();
  const firstSession = sessions[0];

  if (!isDefined(firstSession)) {
    return null;
  }

  const activeMediaTypes = sessions.flatMap(
    (session) => session.activeMediaTypes,
  );
  const isCapturing = isNonEmptyArray(activeMediaTypes);
  const mediaTypes = isCapturing
    ? activeMediaTypes
    : sessions.flatMap((session) => session.pendingMediaTypes);
  const usesAudio = mediaTypes.includes('audio');
  const usesVideo = mediaTypes.includes('video');
  const getMediaLabel = () => {
    if (usesAudio && usesVideo) {
      return t`Microphone and camera`;
    }

    if (usesVideo) {
      return t`Camera`;
    }

    return t`Microphone`;
  };
  const { applicationName } = firstSession;
  const MediaIcon = usesVideo ? IconVideo : IconMicrophone;
  const handleStop = () => {
    for (const session of sessions) {
      session.onStop();
    }
  };

  return (
    <StyledRow role="listitem">
      <MediaIcon size={theme.icon.size.md} aria-hidden />
      <StyledDetails>
        <StyledApplicationName>{applicationName}</StyledApplicationName>
        <StyledMediaType>
          {isCapturing ? getMediaLabel() : t`Waiting for permission`}
        </StyledMediaType>
      </StyledDetails>
      <Button
        size="sm"
        variant="ghost"
        aria-label={
          isCapturing
            ? t`Stop recording for ${applicationName}`
            : t`Cancel recording for ${applicationName}`
        }
        onClick={handleStop}
      >
        {isCapturing ? t`Stop` : t`Cancel`}
      </Button>
    </StyledRow>
  );
};
