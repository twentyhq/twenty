import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { type ReactNode, useCallback, useState } from 'react';

import { RecordingTranscript } from 'src/front-components/components/RecordingTranscript';
import { RecordingVideoPlayer } from 'src/front-components/components/RecordingVideoPlayer';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { useCalendarEventParticipants } from 'src/front-components/hooks/use-calendar-event-participants';
import { useCalendarEventRecording } from 'src/front-components/hooks/use-calendar-event-recording';

const TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS = 0.25;

const StyledRecordingShell = styled.div`
  background: ${recordingThemeCssVariables.background.primary};
  border: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  box-sizing: border-box;
  font-family: ${recordingThemeCssVariables.font.family};
  padding: ${recordingThemeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledRecordingHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${recordingThemeCssVariables.spacing[6]};
`;

const StyledRecordingTitle = styled.h2`
  color: ${recordingThemeCssVariables.font.colorPrimary};
  flex: 1;
  font-size: ${recordingThemeCssVariables.font.sizeMd};
  font-weight: ${recordingThemeCssVariables.font.weightMedium};
  margin: 0;
  overflow: hidden;
  padding-inline: ${recordingThemeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledRecordingBody = styled.div`
  box-sizing: border-box;
  margin-top: ${recordingThemeCssVariables.spacing[2]};
`;

const StyledRecordingContentFrame = styled.div`
  background-color: ${recordingThemeCssVariables.background.secondary};
  border: 1px solid ${recordingThemeCssVariables.border.colorMedium};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  box-sizing: border-box;
  padding: ${recordingThemeCssVariables.spacing[2]};
`;

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${recordingThemeCssVariables.font.colorTertiary};
  display: flex;
  font-family: ${recordingThemeCssVariables.font.family};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  justify-content: center;
  min-height: 240px;
  padding: ${recordingThemeCssVariables.spacing[4]};
`;

const StyledRecordingContainer = styled.div<{
  $hasVideo?: boolean;
}>`
  display: grid;
  grid-template-rows: ${({ $hasVideo }) =>
    $hasVideo ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)'};
  gap: ${recordingThemeCssVariables.spacing[2]};
  min-height: 0;
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
  const { calendarEventParticipants } =
    useCalendarEventParticipants(calendarEventId);

  const videoFileUrl = videoFile?.url ?? undefined;
  const hasVideo = !isUndefined(videoFileUrl);
  let recordingBodyContent: ReactNode;

  if (!isUndefined(errorMessage)) {
    recordingBodyContent = (
      <TranscriptErrorBox
        title="Failed to load the recording"
        description={errorMessage}
      />
    );
  } else if (isCalendarEventRecordingQueryLoading) {
    recordingBodyContent = (
      <StyledRecordingContainer $hasVideo={false}>
        <RecordingVideoPlayer
          src={undefined}
          onTimeUpdate={updateCurrentTimeSeconds}
        />
      </StyledRecordingContainer>
    );
  } else if (isUndefined(transcript) && isUndefined(videoFile)) {
    recordingBodyContent = (
      <StyledCenteredState>
        No recording for this calendar event yet.
      </StyledCenteredState>
    );
  } else {
    recordingBodyContent = (
      <StyledRecordingContainer $hasVideo={hasVideo}>
        {hasVideo && (
          <RecordingVideoPlayer
            src={videoFileUrl}
            onTimeUpdate={updateCurrentTimeSeconds}
          />
        )}
        <RecordingTranscript
          transcript={transcript}
          currentTimeSeconds={currentTimeSeconds}
          calendarEventParticipants={calendarEventParticipants}
        />
      </StyledRecordingContainer>
    );
  }

  return (
    <StyledRecordingShell>
      <StyledRecordingHeader>
        <StyledRecordingTitle>Recording and Transcript</StyledRecordingTitle>
      </StyledRecordingHeader>
      <StyledRecordingBody>
        <StyledRecordingContentFrame>
          {recordingBodyContent}
        </StyledRecordingContentFrame>
      </StyledRecordingBody>
    </StyledRecordingShell>
  );
};
