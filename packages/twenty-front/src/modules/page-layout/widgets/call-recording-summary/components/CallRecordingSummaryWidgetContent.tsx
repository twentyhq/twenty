import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';

export const CallRecordingSummaryWidgetContent = () => {
  const { callRecordingSelection, loading, error } =
    useCalendarEventCallRecording();

  return (
    <CallRecordingSummaryBody
      callRecordingSelection={callRecordingSelection}
      loading={loading}
      error={error}
    />
  );
};
