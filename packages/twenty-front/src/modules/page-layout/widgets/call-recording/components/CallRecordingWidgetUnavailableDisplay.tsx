import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type CallRecordingWidgetUnavailableReason } from '@/page-layout/widgets/call-recording/types/CallRecordingWidgetUnavailableReason';
import { t } from '@lingui/core/macro';

type CallRecordingWidgetUnavailableDisplayProps = {
  reason: CallRecordingWidgetUnavailableReason;
};

export const CallRecordingWidgetUnavailableDisplay = ({
  reason,
}: CallRecordingWidgetUnavailableDisplayProps) => (
  <CallRecordingWidgetEmptyStateDisplay
    animatedPlaceholderType="noWidgets"
    title={t`Call Recording Unavailable`}
    subTitle={
      reason === 'workspaceWithoutCallRecording'
        ? t`Call recording is not available in this workspace.`
        : t`Call recordings are not available on this record.`
    }
  />
);
