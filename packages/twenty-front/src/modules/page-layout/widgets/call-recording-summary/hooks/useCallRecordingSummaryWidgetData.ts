import { useCallRecordingForSummary } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForSummary';
import { useCallRecordingWidgetCount } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetCount';
import { useSubscribeToCallRecordingWidgetUpdates } from '@/page-layout/widgets/call-recording/hooks/useSubscribeToCallRecordingWidgetUpdates';
import { useCallback } from 'react';

export const useCallRecordingSummaryWidgetData = () => {
  const {
    callRecording,
    loading: callRecordingLoading,
    error: callRecordingError,
    restriction,
    refetchCallRecording,
  } = useCallRecordingForSummary();
  const {
    callRecordingsCount,
    loading: callRecordingCountLoading,
    error: callRecordingCountError,
    refetchCallRecordingsCount,
  } = useCallRecordingWidgetCount({
    restriction,
  });

  const refetchCallRecordingWidget = useCallback(async () => {
    await Promise.all([refetchCallRecording(), refetchCallRecordingsCount()]);
  }, [refetchCallRecording, refetchCallRecordingsCount]);

  useSubscribeToCallRecordingWidgetUpdates({
    restriction,
    refetchCallRecordingWidget,
  });

  return {
    callRecording,
    callRecordingsCount,
    loading: callRecordingLoading || callRecordingCountLoading,
    error: callRecordingError ?? callRecordingCountError,
    restriction,
    refetchCallRecordingWidget,
  };
};
