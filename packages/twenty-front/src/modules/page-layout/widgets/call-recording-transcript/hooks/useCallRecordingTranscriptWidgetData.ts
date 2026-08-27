import { useCallRecordingForTranscript } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingForTranscript';
import { useCallRecordingWidgetData } from '@/page-layout/widgets/call-recording/hooks/useCallRecordingWidgetData';

export const useCallRecordingTranscriptWidgetData = () => {
  const callRecordingData = useCallRecordingForTranscript();

  return useCallRecordingWidgetData({ callRecordingData });
};
