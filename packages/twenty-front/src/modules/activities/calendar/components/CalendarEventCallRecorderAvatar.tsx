import { AppChip } from '@/applications/components/AppChip';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId } from 'react';
import { createPortal } from 'react-dom';
import { AppTooltip, TooltipDelay, TooltipPosition } from 'twenty-ui/surfaces';
import { CallRecordingStatus } from '~/generated/graphql';

const IN_PROGRESS_CALL_RECORDING_STATUSES: CallRecordingStatus[] = [
  CallRecordingStatus.JOINING,
  CallRecordingStatus.RECORDING,
  CallRecordingStatus.PROCESSING,
];

const getCallRecordingStatusLabel = (status: CallRecordingStatus) => {
  switch (status) {
    case CallRecordingStatus.SCHEDULED:
      return t`Scheduled`;
    case CallRecordingStatus.JOINING:
      return t`Joining`;
    case CallRecordingStatus.RECORDING:
      return t`Recording`;
    case CallRecordingStatus.PROCESSING:
      return t`Processing`;
    case CallRecordingStatus.COMPLETED:
      return t`Completed`;
    case CallRecordingStatus.FAILED:
      return t`Failed`;
  }
};

const StyledContainer = styled.div<{ isDisabled: boolean }>`
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'inherit')};
  display: flex;
  filter: ${({ isDisabled }) => (isDisabled ? 'grayscale(1)' : 'none')};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
`;

type CalendarEventCallRecorderAvatarProps = {
  applicationId?: string | null;
  status: CallRecordingStatus;
};

export const CalendarEventCallRecorderAvatar = ({
  applicationId,
  status,
}: CalendarEventCallRecorderAvatarProps) => {
  const instanceId = useId();
  const hasFailed = status === CallRecordingStatus.FAILED;
  const tooltipAnchorId = `call-recorder-${instanceId.replace(/[^a-zA-Z0-9-_]/g, '-')}`;

  return (
    <>
      <StyledContainer id={tooltipAnchorId} isDisabled={hasFailed}>
        <AppChip
          applicationId={applicationId}
          fallbackApplicationData={{ name: t`Call recorder` }}
          pulsing={IN_PROGRESS_CALL_RECORDING_STATUSES.includes(status)}
          size="md"
          rounded
          chipOnly
        />
      </StyledContainer>
      {createPortal(
        <AppTooltip
          anchorSelect={`#${tooltipAnchorId}`}
          content={getCallRecordingStatusLabel(status)}
          delay={TooltipDelay.shortDelay}
          place={TooltipPosition.Top}
          positionStrategy="fixed"
        />,
        document.body,
      )}
    </>
  );
};
