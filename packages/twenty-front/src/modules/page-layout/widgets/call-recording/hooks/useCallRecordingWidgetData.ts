import { useCallRecordingWidgetCount } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetCount';
import { type WidgetCallRecordingCandidate } from '@/page-layout/widgets/call-recording/types/WidgetCallRecordingCandidate';
import { type WidgetAccessDenialInfo } from '@/page-layout/widgets/types/WidgetAccessDenialInfo';

type CallRecordingWidgetLeafData = {
  callRecording: WidgetCallRecordingCandidate | undefined;
  loading: boolean;
  error: Error | undefined;
  restriction: WidgetAccessDenialInfo | undefined;
  refetch: () => Promise<unknown>;
};

export const useCallRecordingWidgetData = ({
  callRecordingData,
}: {
  callRecordingData: CallRecordingWidgetLeafData;
}) => {
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
