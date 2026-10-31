import { type MediaAccessSession } from '@/media-access/types/MediaAccessSession';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconMicrophone, IconVideo } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

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

const StyledOwnerName = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow-wrap: anywhere;
`;

const StyledMediaType = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow-wrap: anywhere;
`;

export const MediaAccessSessionRow = ({
  sessions,
}: {
  sessions: MediaAccessSession[];
}) => {
  const theme = useTheme();
  const firstSession = sessions[0];

  if (!isDefined(firstSession)) {
    return null;
  }

  const isCapturing = sessions.some(
    (session) => session.status === 'capturing',
  );
  const isDelegated = firstSession.status === 'delegated';
  const mediaTypes = sessions
    .filter((session) => !isCapturing || session.status === 'capturing')
    .flatMap((session) => session.mediaTypes);
  const hasAudioMediaType = mediaTypes.includes('audio');
  const hasVideoMediaType = mediaTypes.includes('video');
  const getMediaLabel = () => {
    if (hasAudioMediaType && hasVideoMediaType) {
      return isDelegated
        ? t`Microphone and camera access enabled`
        : t`Microphone and camera`;
    }

    if (hasVideoMediaType) {
      return isDelegated ? t`Camera access enabled` : t`Camera`;
    }

    return isDelegated ? t`Microphone access enabled` : t`Microphone`;
  };
  const { ownerName, origin } = firstSession;
  const MediaIcon = hasVideoMediaType ? IconVideo : IconMicrophone;
  const handleStop = () => {
    for (const session of sessions) {
      session.onStop();
    }
  };
  const getActionLabels = () => {
    if (isDelegated) {
      return {
        actionLabel: t`Disable`,
        actionAriaLabel: t`Disable media access for ${ownerName}`,
      };
    }

    if (isCapturing) {
      return {
        actionLabel: t`Stop`,
        actionAriaLabel: t`Stop capture for ${ownerName}`,
      };
    }

    return {
      actionLabel: t`Cancel`,
      actionAriaLabel: t`Cancel media request for ${ownerName}`,
    };
  };
  const { actionLabel, actionAriaLabel } = getActionLabels();

  return (
    <StyledRow role="listitem">
      <MediaIcon size={theme.icon.size.md} aria-hidden />
      <StyledDetails>
        <StyledOwnerName>{ownerName}</StyledOwnerName>
        <StyledMediaType>
          {isCapturing || isDelegated
            ? getMediaLabel()
            : t`Waiting for permission`}
        </StyledMediaType>
        {isDelegated && <StyledMediaType>{origin}</StyledMediaType>}
      </StyledDetails>
      <Button
        size="sm"
        variant="ghost"
        aria-label={actionAriaLabel}
        onClick={handleStop}
      >
        {actionLabel}
      </Button>
    </StyledRow>
  );
};
