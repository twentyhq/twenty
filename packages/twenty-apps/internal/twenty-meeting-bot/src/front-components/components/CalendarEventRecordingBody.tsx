import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';

import { RecordingTranscript } from 'src/front-components/components/RecordingTranscript';
import { RecordingVideoPlayer } from 'src/front-components/components/RecordingVideoPlayer';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';

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
  gap: ${recordingThemeCssVariables.spacing[2]};
  grid-template-rows: ${({ $hasVideo }) =>
    $hasVideo ? 'auto minmax(0, 1fr)' : 'minmax(0, 1fr)'};
  min-height: 0;
`;

type CalendarEventRecordingBodyProps = {
  transcript: unknown;
  videoFileUrl: string | undefined;
  isCalendarEventRecordingQueryLoading: boolean;
  errorMessage: string | undefined;
  currentTimeSeconds: number;
  calendarEventParticipants: CalendarEventRecordingParticipant[];
  onVideoTimeUpdate: (videoCurrentTimeSeconds: number) => void;
};

export const CalendarEventRecordingBody = ({
  transcript,
  videoFileUrl,
  isCalendarEventRecordingQueryLoading,
  errorMessage,
  currentTimeSeconds,
  calendarEventParticipants,
  onVideoTimeUpdate,
}: CalendarEventRecordingBodyProps) => {
  const hasVideo = !isUndefined(videoFileUrl);

  if (!isUndefined(errorMessage)) {
    return (
      <TranscriptErrorBox
        title="Failed to load the recording"
        description={errorMessage}
      />
    );
  }

  if (isCalendarEventRecordingQueryLoading) {
    return (
      <StyledRecordingContainer $hasVideo={false}>
        <RecordingVideoPlayer
          src={undefined}
          onTimeUpdate={onVideoTimeUpdate}
        />
      </StyledRecordingContainer>
    );
  }

  if (isUndefined(transcript) && !hasVideo) {
    return (
      <StyledCenteredState>
        No recording for this calendar event yet.
      </StyledCenteredState>
    );
  }

  return (
    <StyledRecordingContainer $hasVideo={hasVideo}>
      {hasVideo && (
        <RecordingVideoPlayer
          src={videoFileUrl}
          onTimeUpdate={onVideoTimeUpdate}
        />
      )}
      <RecordingTranscript
        transcript={transcript}
        currentTimeSeconds={currentTimeSeconds}
        calendarEventParticipants={calendarEventParticipants}
      />
    </StyledRecordingContainer>
  );
};
