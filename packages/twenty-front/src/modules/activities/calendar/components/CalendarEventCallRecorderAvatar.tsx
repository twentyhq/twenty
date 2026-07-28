import { AppChip } from '@/applications/components/AppChip';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { CallRecordingStatus } from '~/generated/graphql';

type CallRecorderStatusColor = 'blue' | 'orange' | 'green' | 'red';

const CALL_RECORDER_STATUS_COLORS: Record<
  CallRecordingStatus,
  CallRecorderStatusColor
> = {
  [CallRecordingStatus.SCHEDULED]: 'blue',
  [CallRecordingStatus.JOINING]: 'orange',
  [CallRecordingStatus.RECORDING]: 'orange',
  [CallRecordingStatus.PROCESSING]: 'orange',
  [CallRecordingStatus.COMPLETED]: 'green',
  [CallRecordingStatus.FAILED]: 'red',
};

const StyledStatusRing = styled.div<{ status: CallRecordingStatus }>`
  align-items: center;
  border: 1px solid
    ${({ status }) =>
      themeCssVariables.tag.text[CALL_RECORDER_STATUS_COLORS[status]]};
  border-radius: 50%;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  width: ${themeCssVariables.spacing[4]};
`;

type CalendarEventCallRecorderAvatarProps = {
  applicationId?: string | null;
  status: CallRecordingStatus;
};

export const CalendarEventCallRecorderAvatar = ({
  applicationId,
  status,
}: CalendarEventCallRecorderAvatarProps) => (
  <StyledStatusRing status={status}>
    <AppChip applicationId={applicationId} size="sm" type="rounded" chipOnly />
  </StyledStatusRing>
);
