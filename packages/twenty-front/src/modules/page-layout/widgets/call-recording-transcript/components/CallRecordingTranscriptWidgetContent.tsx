import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';

export const CallRecordingTranscriptWidgetContent = () => {
  const { callRecordingState } = useCalendarEventCallRecording();

  return (
    <CallRecordingTranscriptBody callRecordingState={callRecordingState} />
  );
};
