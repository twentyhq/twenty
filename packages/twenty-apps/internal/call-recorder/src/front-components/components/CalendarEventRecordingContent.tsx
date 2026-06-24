import styled from '@emotion/styled';
import { useCallback, useState } from 'react';

import { CalendarEventRecordingBody } from 'src/front-components/components/CalendarEventRecordingBody';
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

  return (
    <StyledRecordingShell>
      <StyledRecordingHeader>
        <StyledRecordingTitle>Recording and Transcript</StyledRecordingTitle>
      </StyledRecordingHeader>
      <StyledRecordingBody>
        <StyledRecordingContentFrame>
          <CalendarEventRecordingBody
            transcript={transcript}
            videoFileUrl={videoFileUrl}
            isCalendarEventRecordingQueryLoading={
              isCalendarEventRecordingQueryLoading
            }
            errorMessage={errorMessage}
            currentTimeSeconds={currentTimeSeconds}
            calendarEventParticipants={calendarEventParticipants}
            onVideoTimeUpdate={updateCurrentTimeSeconds}
          />
        </StyledRecordingContentFrame>
      </StyledRecordingBody>
    </StyledRecordingShell>
  );
};
