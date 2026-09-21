import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { type CallRecordingWidgetKind } from '@/page-layout/widgets/call-recording/types/CallRecordingWidgetKind';
import { type CallRecordingWidgetUnavailableReason } from '@/page-layout/widgets/call-recording/types/CallRecordingWidgetUnavailableReason';
import { t } from '@lingui/core/macro';

type CallRecordingWidgetUnavailableDisplayProps = {
  kind: CallRecordingWidgetKind;
  reason: CallRecordingWidgetUnavailableReason;
};

export const CallRecordingWidgetUnavailableDisplay = ({
  kind,
  reason,
}: CallRecordingWidgetUnavailableDisplayProps) => {
  if (kind === 'transcript') {
    return (
      <CallRecordingWidgetEmptyStateDisplay
        animatedPlaceholderType="noWidgets"
        title={t`Transcript Unavailable`}
        subTitle={t`Transcripts are not available on this record.`}
      />
    );
  }

  return (
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
};
