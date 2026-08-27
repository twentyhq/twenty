import { useCallRecordingWidgetCount } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetCount';
import { useCallRecordingForTranscript } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForTranscript';

export const useCallRecordingTranscriptWidgetData = () => {
  const callRecordingData = useCallRecordingForTranscript();
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
