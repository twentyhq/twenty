import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';

export const CallRecordingTranscriptWidgetContent = () => {
  const { callRecording, loading, error } = useCalendarEventCallRecording();

  return (
    <CallRecordingTranscriptBody
      callRecording={callRecording}
      loading={loading}
      error={error}
    />
  );
};
