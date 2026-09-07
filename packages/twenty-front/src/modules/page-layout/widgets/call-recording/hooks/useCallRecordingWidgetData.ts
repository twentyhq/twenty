import { useCallRecordingForWidget } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForWidget';
import { useCallRecordingWidgetCount } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetCount';
import { useSubscribeToCallRecordingWidgetUpdates } from '@/page-layout/widgets/call-recording/hooks/useSubscribeToCallRecordingWidgetUpdates';
import { type CallRecordingWidgetKind } from '@/page-layout/widgets/call-recording/types/CallRecordingWidgetKind';
import { useCallback } from 'react';

export const useCallRecordingWidgetData = ({
  kind,
}: {
  kind: CallRecordingWidgetKind;
}) => {
  const {
    callRecording,
    loading: callRecordingLoading,
    error: callRecordingError,
    restriction,
    refetchCallRecording,
  } = useCallRecordingForWidget({ kind });
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
