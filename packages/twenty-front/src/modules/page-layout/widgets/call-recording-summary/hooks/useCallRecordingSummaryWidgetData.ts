import { useCallRecordingWidgetCount } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetCount';
import { useCallRecordingForSummary } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForSummary';

export const useCallRecordingSummaryWidgetData = () => {
  const callRecordingData = useCallRecordingForSummary();
  const callRecordingCount = useCallRecordingWidgetCount({
    restriction: callRecordingData.restriction,
    refetchCallRecording: callRecordingData.refetch,
  });

  return {
    callRecording: callRecordingData.callRecording,
    callRecordingsCount: callRecordingCount.callRecordingsCount,
    loading: callRecordingData.loading || callRecordingCount.loading,
    error: callRecordingData.error ?? callRecordingCount.error,
    restriction: callRecordingData.restriction,
    refetch: callRecordingCount.refetch,
  };
};
