import { useCallRecordingForTranscript } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForTranscript';
import { useCallRecordingWidgetCount } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetCount';
import { useSubscribeToCallRecordingWidgetUpdates } from '@/page-layout/widgets/call-recording/hooks/useSubscribeToCallRecordingWidgetUpdates';
import { useCallback } from 'react';

export const useCallRecordingTranscriptWidgetData = () => {
  const {
    callRecording,
    loading: callRecordingLoading,
    error: callRecordingError,
    restriction,
    refetchCallRecording,
  } = useCallRecordingForTranscript();
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
