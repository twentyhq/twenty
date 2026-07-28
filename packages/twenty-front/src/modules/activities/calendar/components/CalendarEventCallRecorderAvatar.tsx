import { AppChip } from '@/applications/components/AppChip';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { CallRecordingStatus } from '~/generated/graphql';

const CALL_RECORDER_STATUS_BORDERS: Record<CallRecordingStatus, string> = {
  [CallRecordingStatus.SCHEDULED]: `2px solid ${themeCssVariables.tag.text.blue}`,
  [CallRecordingStatus.JOINING]: `2px solid ${themeCssVariables.tag.text.orange}`,
  [CallRecordingStatus.RECORDING]: `2px solid ${themeCssVariables.tag.text.orange}`,
  [CallRecordingStatus.PROCESSING]: `2px solid ${themeCssVariables.tag.text.orange}`,
  [CallRecordingStatus.COMPLETED]: `2px solid ${themeCssVariables.tag.text.green}`,
  [CallRecordingStatus.FAILED]: `2px solid ${themeCssVariables.tag.text.red}`,
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
