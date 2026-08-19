import { CallRecordingWidgetEmptyStateDisplay } from '@/page-layout/widgets/calendar-event-call-recording/components/CallRecordingWidgetEmptyStateDisplay';
import { t } from '@lingui/core/macro';

export const CallRecordingWidgetUnavailableDisplay = () => (
  <CallRecordingWidgetEmptyStateDisplay
    animatedPlaceholderType="noWidgets"
    title={t`Call Recording Unavailable`}
    subTitle={t`Call recording is not available in this workspace.`}
  />
);
