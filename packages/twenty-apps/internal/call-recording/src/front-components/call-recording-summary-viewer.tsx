import { SummaryViewer } from 'src/components/SummaryViewer';
import { SummaryViewerSkeleton } from 'src/components/SummaryViewerSkeleton';
import { CALL_RECORDING_SUMMARY_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-summary-viewer-front-component-universal-identifier';
import { useCallRecording } from 'src/hooks/useCallRecording';
import { defineFrontComponent } from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

const CallRecordingSummaryViewer = () => {
  const { callRecording, loading, error } = useCallRecording();

  if (loading) {
    return <SummaryViewerSkeleton />;
  }

  if (isDefined(error)) {
    throw error;
  }

  return <SummaryViewer markdown={callRecording?.summary?.markdown} />;
};

export default defineFrontComponent({
  universalIdentifier:
    CALL_RECORDING_SUMMARY_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Call Recording Summary Viewer',
  description: 'Displays the AI-generated summary of a call recording',
  component: CallRecordingSummaryViewer,
});
