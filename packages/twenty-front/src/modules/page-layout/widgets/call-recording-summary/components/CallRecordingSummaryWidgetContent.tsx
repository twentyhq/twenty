import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';

export const CallRecordingSummaryWidgetContent = () => {
  const { callRecording, loading, error, restriction } =
    useCalendarEventCallRecording({ queryScope: 'call-recording-summary' });

  return (
    <CallRecordingSummaryBody
      callRecording={callRecording}
      loading={loading}
      error={error}
      restriction={restriction}
    />
  );
};
