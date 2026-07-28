import { AppChip } from '@/applications/components/AppChip';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { CallRecordingStatus } from '~/generated/graphql';

const CALL_RECORDER_STATUS_BORDER_COLORS: Record<CallRecordingStatus, string> =
  {
    [CallRecordingStatus.SCHEDULED]: themeCssVariables.tag.text.blue,
    [CallRecordingStatus.JOINING]: themeCssVariables.tag.text.orange,
    [CallRecordingStatus.RECORDING]: themeCssVariables.tag.text.orange,
    [CallRecordingStatus.PROCESSING]: themeCssVariables.tag.text.orange,
    [CallRecordingStatus.COMPLETED]: themeCssVariables.tag.text.green,
    [CallRecordingStatus.FAILED]: themeCssVariables.tag.text.red,
  };

type CalendarEventCallRecorderAvatarProps = {
  applicationId?: string | null;
  status: CallRecordingStatus;
};

export const CalendarEventCallRecorderAvatar = ({
  applicationId,
  status,
}: CalendarEventCallRecorderAvatarProps) => (
  <AppChip
    applicationId={applicationId}
    fallbackApplicationData={{ name: t`Call recorder` }}
    borderColor={CALL_RECORDER_STATUS_BORDER_COLORS[status]}
    size="md"
    rounded
    chipOnly
  />
);
