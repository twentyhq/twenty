import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';

export const CallRecordingTranscriptWidgetContent = () => {
  const { callRecordingSelection, loading, error } =
    useCalendarEventCallRecording();

  return (
    <CallRecordingTranscriptBody
      callRecordingSelection={callRecordingSelection}
      loading={loading}
      error={error}
    />
  );
};
