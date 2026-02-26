import { CallRecordingViewerSkeleton } from 'src/components/CallRecordingViewerSkeleton';
import { MediaPlayer } from 'src/components/MediaPlayer';
import { SummaryViewerSkeleton } from 'src/components/SummaryViewerSkeleton';
import { TranscriptViewer } from 'src/components/TranscriptViewer';
import { CALL_RECORDING_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-viewer-front-component-universal-identifier';
import { useCallRecording } from 'src/hooks/useCallRecording';
import { useTranscript } from 'src/hooks/useTranscript';
import { defineFrontComponent } from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

export const CallRecordingViewer = () => {
  const { callRecording, loading, error } = useCallRecording();

  const transcriptFileUrl = callRecording?.transcriptFile[0]?.url;

  const {
    entries: transcriptEntries,
    loading: transcriptLoading,
  } = useTranscript(transcriptFileUrl);

  if (loading) {
    return <CallRecordingViewerSkeleton />;
  }

  if (isDefined(error)) {
    throw error;
  }

  const recordingFile = callRecording?.recordingFile[0];

  const recordingFileUrl = recordingFile?.url;
  const recordingFileExtension = recordingFile?.extension;

  if (!isDefined(recordingFileUrl)) {
    return;
  }

  if (!isDefined(recordingFileExtension)) {
    return;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <MediaPlayer
        url={recordingFileUrl}
        extension={recordingFileExtension}
      />
      {transcriptLoading ? (
        <SummaryViewerSkeleton />
      ) : (
        <TranscriptViewer entries={transcriptEntries} />
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: CALL_RECORDING_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Call Recording Viewer',
  description: 'A viewer for call recordings',
  component: CallRecordingViewer,
});
