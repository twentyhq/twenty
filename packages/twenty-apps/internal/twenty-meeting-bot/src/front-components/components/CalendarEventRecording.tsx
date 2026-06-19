import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useState } from 'react';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';

import { RecordingTranscript } from 'src/front-components/components/RecordingTranscript';
import { RecordingVideoPlayer } from 'src/front-components/components/RecordingVideoPlayer';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { useCalendarEventRecording } from 'src/front-components/hooks/use-calendar-event-recording';
import { getVideoFileExtension } from 'src/front-components/utils/get-video-file-extension.util';

const StyledStateContainer = styled.div`
  box-sizing: border-box;
  font-family: ${recordingThemeCssVariables.font.family};
  height: 100%;
  padding: ${recordingThemeCssVariables.spacing[4]};
`;

const StyledCenteredState = styled(StyledStateContainer)`
  align-items: center;
  color: ${recordingThemeCssVariables.font.colorTertiary};
  display: flex;
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  justify-content: center;
`;

const StyledRecordingContainer = styled(StyledStateContainer)`
  display: flex;
  flex-direction: column;
  gap: ${recordingThemeCssVariables.spacing[4]};
  overflow: hidden;
`;

export const CalendarEventRecording = () => {
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const selectedRecordIds = useSelectedRecordIds();
  const calendarEventId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  const { transcript, videoFile, loading, errorMessage } =
    useCalendarEventRecording(calendarEventId);

  if (isUndefined(calendarEventId)) {
    return (
      <StyledCenteredState>
        Open a calendar event to see its recording.
      </StyledCenteredState>
    );
  }

  if (loading) {
    return <StyledCenteredState>Loading recording…</StyledCenteredState>;
  }

  if (!isUndefined(errorMessage)) {
    return (
      <TranscriptErrorBox
        title="Failed to load the recording"
        description={errorMessage}
      />
    );
  }

  if (isUndefined(transcript) && isUndefined(videoFile)) {
    return (
      <StyledCenteredState>
        No recording for this calendar event yet.
      </StyledCenteredState>
    );
  }

  const videoFileUrl = videoFile?.url ?? undefined;
  const videoFileExtension = isUndefined(videoFile)
    ? undefined
    : getVideoFileExtension(videoFile);
  const hasVideo =
    !isUndefined(videoFileUrl) && !isUndefined(videoFileExtension);

  return (
    <StyledRecordingContainer>
      {hasVideo && (
        <RecordingVideoPlayer
          src={videoFileUrl}
          extension={videoFileExtension}
          onTimeUpdate={setCurrentTimeSeconds}
        />
      )}
      <RecordingTranscript
        transcript={transcript}
        currentTimeSeconds={currentTimeSeconds}
      />
    </StyledRecordingContainer>
  );
};
