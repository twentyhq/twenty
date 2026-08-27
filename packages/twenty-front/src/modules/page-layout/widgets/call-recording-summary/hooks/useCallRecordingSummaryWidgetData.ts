import { useCallRecordingForSummary } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForSummary';
import { useCallRecordingWidgetData } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetData';

export const useCallRecordingSummaryWidgetData = () => {
  const callRecordingData = useCallRecordingForSummary();

  return useCallRecordingWidgetData({ callRecordingData });
};
