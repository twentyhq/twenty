import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useCallback, useState } from 'react';

import { RecordingTranscript } from 'src/front-components/components/RecordingTranscript';
import { RecordingVideoPlayer } from 'src/front-components/components/RecordingVideoPlayer';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { useCalendarEventRecording } from 'src/front-components/hooks/use-calendar-event-recording';

const TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS = 0.25;

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
  gap: ${recordingThemeCssVariables.spacing[2]};
  overflow: hidden;
  padding: 0;
`;

type CalendarEventRecordingContentProps = {
  calendarEventId: string;
};

export const CalendarEventRecordingContent = ({
  calendarEventId,
}: CalendarEventRecordingContentProps) => {
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const updateCurrentTimeSeconds = useCallback(
    (videoCurrentTimeSeconds: number) => {
      const nextCurrentTimeSeconds =
        Math.floor(
          videoCurrentTimeSeconds / TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS,
        ) * TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS;

      setCurrentTimeSeconds((previousCurrentTimeSeconds) =>
        previousCurrentTimeSeconds === nextCurrentTimeSeconds
          ? previousCurrentTimeSeconds
          : nextCurrentTimeSeconds,
      );
    },
    [],
  );

  const {
    transcript,
    videoFile,
    isCalendarEventRecordingQueryLoading,
    errorMessage,
  } = useCalendarEventRecording(calendarEventId);

  if (!isUndefined(errorMessage)) {
    return (
      <TranscriptErrorBox
        title="Failed to load the recording"
        description={errorMessage}
      />
    );
  }

  const videoFileUrl = videoFile?.url ?? undefined;
  const hasVideo = !isUndefined(videoFileUrl);

  if (isCalendarEventRecordingQueryLoading) {
    return (
      <StyledRecordingContainer>
        <RecordingVideoPlayer
          src={undefined}
          onTimeUpdate={updateCurrentTimeSeconds}
        />
      </StyledRecordingContainer>
    );
  }

  if (isUndefined(transcript) && isUndefined(videoFile)) {
    return (
      <StyledCenteredState>
        No recording for this calendar event yet.
      </StyledCenteredState>
    );
  }

  return (
    <StyledRecordingContainer>
      {hasVideo && (
        <RecordingVideoPlayer
          src={videoFileUrl}
          onTimeUpdate={updateCurrentTimeSeconds}
        />
      )}
      <RecordingTranscript
        transcript={transcript}
        currentTimeSeconds={currentTimeSeconds}
      />
    </StyledRecordingContainer>
  );
};
