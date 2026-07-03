import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { RecordingSkeletonLoader } from 'src/front-components/components/RecordingSkeletonLoader';
import { RecordingTranscript } from 'src/front-components/components/RecordingTranscript';
import { RecordingVideoPlayer } from 'src/front-components/components/RecordingVideoPlayer';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  justify-content: center;
  min-height: 240px;
  padding: ${() => themeCssVariables.spacing[4]};
`;

const StyledRecordingContainer = styled.div<{
  $hasVideo?: boolean;
}>`
  display: grid;
  gap: ${() => themeCssVariables.spacing[2]};
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
  onVideoRetry: () => void;
};

export const CalendarEventRecordingBody = ({
  transcript,
  videoFileUrl,
  isCalendarEventRecordingQueryLoading,
  errorMessage,
  currentTimeSeconds,
  calendarEventParticipants,
  onVideoTimeUpdate,
  onVideoRetry,
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
    return <RecordingSkeletonLoader />;
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
          onRetry={onVideoRetry}
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
