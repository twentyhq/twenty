import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconRobot } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
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

const StyledCallRecorderAvatar = styled.div<{ status: CallRecordingStatus }>`
  align-items: center;
  background-color: ${({ status }) =>
    themeCssVariables.tag.background[CALL_RECORDER_STATUS_COLORS[status]]};
  border-radius: 50%;
  color: ${({ status }) =>
    themeCssVariables.tag.text[CALL_RECORDER_STATUS_COLORS[status]]};
  display: flex;
  flex-shrink: 0;
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  width: ${themeCssVariables.spacing[4]};
`;

type CalendarEventCallRecorderAvatarProps = {
  status: CallRecordingStatus;
};

export const CalendarEventCallRecorderAvatar = ({
  status,
}: CalendarEventCallRecorderAvatarProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledCallRecorderAvatar status={status}>
      <IconRobot size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
    </StyledCallRecorderAvatar>
  );
};
