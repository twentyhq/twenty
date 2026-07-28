import { AppChip } from '@/applications/components/AppChip';
import { t } from '@lingui/core/macro';
import { CallRecordingStatus } from '~/generated/graphql';

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
    pulsing={status === CallRecordingStatus.PROCESSING}
    size="md"
    rounded
    chipOnly
  />
);
