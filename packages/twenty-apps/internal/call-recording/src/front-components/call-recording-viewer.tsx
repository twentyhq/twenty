import styled from '@emotion/styled';
import { useState } from 'react';

import { CallRecordingViewerSkeleton } from 'src/components/CallRecordingViewerSkeleton';
import { MediaPlayer } from 'src/components/MediaPlayer';
import { SummaryViewerSkeleton } from 'src/components/SummaryViewerSkeleton';
import { TranscriptViewer } from 'src/components/TranscriptViewer';
import { CALL_RECORDING_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/call-recording-viewer-front-component-universal-identifier';
import { useCallRecording } from 'src/hooks/useCallRecording';
import { useTranscript } from 'src/hooks/useTranscript';
import { defineFrontComponent } from 'twenty-sdk/define';
import { isDefined } from 'twenty-shared/utils';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
`;

export const CallRecordingViewer = () => {
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);

  const { callRecording, loading, error } = useCallRecording();

  const transcriptFileUrl = callRecording?.transcriptFile[0]?.url;

  const { entries: transcriptEntries, loading: transcriptLoading } =
    useTranscript(transcriptFileUrl);

  if (loading) {
    return <CallRecordingViewerSkeleton />;
  }

  if (isDefined(error)) {
    throw error;
  }

  const recordingFile = callRecording?.recordingFile[0];

  const recordingFileUrl = recordingFile?.url;
  const recordingFileExtension = recordingFile?.extension;

  const hasRecording =
    isDefined(recordingFileUrl) && isDefined(recordingFileExtension);

  return (
    <StyledContainer>
      {hasRecording && (
        <MediaPlayer
          url={recordingFileUrl}
          extension={recordingFileExtension}
          onTimeUpdate={setCurrentTimeSeconds}
        />
      )}
      {transcriptLoading ? (
        <SummaryViewerSkeleton />
      ) : (
        <TranscriptViewer
          entries={transcriptEntries}
          currentTimeSeconds={currentTimeSeconds}
        />
      )}
    </StyledContainer>
  );
};

export default defineFrontComponent({
  universalIdentifier:
    CALL_RECORDING_VIEWER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Call Recording Viewer',
  description: 'A viewer for call recordings',
  component: CallRecordingViewer,
});
