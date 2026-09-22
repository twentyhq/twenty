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
  const title =
    kind === 'transcript'
      ? t`Transcript Unavailable`
      : t`Call Recording Unavailable`;

  const subTitleByReason: Record<CallRecordingWidgetUnavailableReason, string> =
    kind === 'transcript'
      ? {
          workspaceWithoutCallRecording: t`Transcripts are not available in this workspace.`,
          recordWithoutCallRecording: t`Transcripts are not available on this record.`,
        }
      : {
          workspaceWithoutCallRecording: t`Call recording is not available in this workspace.`,
          recordWithoutCallRecording: t`Call recordings are not available on this record.`,
        };

  return (
    <CallRecordingWidgetEmptyStateDisplay
      animatedPlaceholderType="noWidgets"
      title={title}
      subTitle={subTitleByReason[reason]}
    />
  );
};
