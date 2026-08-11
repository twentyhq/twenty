import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { useCalendarEventCallRecordingTranscript } from '@/page-layout/widgets/call-recording-transcript/hooks/useCalendarEventCallRecordingTranscript';

export const CallRecordingTranscriptWidgetContent = () => {
  const { callRecordingTranscriptState } =
    useCalendarEventCallRecordingTranscript();

  return (
    <CallRecordingTranscriptBody
      callRecordingTranscriptState={callRecordingTranscriptState}
    />
  );
};
