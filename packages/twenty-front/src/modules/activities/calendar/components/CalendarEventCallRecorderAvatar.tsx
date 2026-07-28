import { AppChip } from '@/applications/components/AppChip';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { CallRecordingStatus } from '~/generated/graphql';

const CALL_RECORDER_STATUS_BORDERS: Record<CallRecordingStatus, string> = {
  [CallRecordingStatus.SCHEDULED]: `1px solid ${themeCssVariables.tag.text.blue}`,
  [CallRecordingStatus.JOINING]: `1px solid ${themeCssVariables.tag.text.orange}`,
  [CallRecordingStatus.RECORDING]: `1px solid ${themeCssVariables.tag.text.orange}`,
  [CallRecordingStatus.PROCESSING]: `1px solid ${themeCssVariables.tag.text.orange}`,
  [CallRecordingStatus.COMPLETED]: `1px solid ${themeCssVariables.tag.text.green}`,
  [CallRecordingStatus.FAILED]: `1px solid ${themeCssVariables.tag.text.red}`,
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
    border={CALL_RECORDER_STATUS_BORDERS[status]}
    size="md"
    rounded
    chipOnly
  />
);
