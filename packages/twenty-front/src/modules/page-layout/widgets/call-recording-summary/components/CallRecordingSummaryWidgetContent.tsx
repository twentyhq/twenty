import { useWidgetCallRecording } from '@/page-layout/widgets/call-recording/hooks/useWidgetCallRecording';
import { CallRecordingSummaryBody } from '@/page-layout/widgets/call-recording-summary/components/CallRecordingSummaryBody';

export const CallRecordingSummaryWidgetContent = () => {
  const { callRecording, loading, error, restriction } = useWidgetCallRecording(
    { queryScope: 'call-recording-summary' },
  );

  return (
    <CallRecordingSummaryBody
      callRecording={callRecording}
      loading={loading}
      error={error}
      restriction={restriction}
    />
  );
};
