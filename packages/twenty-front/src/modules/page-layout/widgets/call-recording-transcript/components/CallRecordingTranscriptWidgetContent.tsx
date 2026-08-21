import { useCalendarEventCallRecording } from '@/page-layout/widgets/calendar-event-call-recording/hooks/useCalendarEventCallRecording';
import { CallRecordingTranscriptBody } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptBody';
import { CallRecordingTranscriptHeaderDataEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptHeaderDataEffect';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';

export const CallRecordingTranscriptWidgetContent = () => {
  const {
    callRecording,
    callRecordingsCount,
    loading,
    error,
    restriction,
    refetch,
  } = useCalendarEventCallRecording({
    queryScope: 'call-recording-transcript',
  });

  return (
    <>
      <WidgetHeaderCountEffect
        count={callRecordingsCount > 0 ? callRecordingsCount : undefined}
      />
      <CallRecordingTranscriptHeaderDataEffect
        callRecording={callRecording}
        callRecordingsCount={callRecordingsCount}
      />
      <CallRecordingTranscriptBody
        callRecording={callRecording}
        loading={loading}
        error={error}
        restriction={restriction}
        refetchCallRecording={refetch}
      />
    </>
  );
};
