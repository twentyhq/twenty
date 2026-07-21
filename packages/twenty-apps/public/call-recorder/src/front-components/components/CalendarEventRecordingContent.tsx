import styled from '@emotion/styled';
import { isNonEmptyArray } from '@sniptt/guards';
import { useMemo, useState } from 'react';
import { IconLink } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventRecordingBody } from 'src/front-components/components/CalendarEventRecordingBody';
import { CopyToClipboardButton } from 'src/front-components/components/CopyToClipboardButton';
import { useCalendarEventParticipants } from 'src/front-components/hooks/use-calendar-event-participants';
import { useCalendarEventRecording } from 'src/front-components/hooks/use-calendar-event-recording';
import { buildTranscriptPlainText } from 'src/front-components/utils/build-transcript-plain-text.util';
import { parseTranscriptEntries } from 'src/front-components/utils/parse-transcript-entries.util';

const TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS = 0.25;

const StyledRecordingShell = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  font-family: ${() => themeCssVariables.font.family};
  padding: ${() => themeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledRecordingHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${() => themeCssVariables.spacing[6]};
`;

const StyledRecordingTitle = styled.h2`
  color: ${() => themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${() => themeCssVariables.font.size.md};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin: 0;
  overflow: hidden;
  padding-inline: ${() => themeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledRecordingHeaderActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledRecordingBody = styled.div`
  box-sizing: border-box;
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

const StyledRecordingContentFrame = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  padding: ${() => themeCssVariables.spacing[2]};
`;

type CalendarEventRecordingContentProps = {
  calendarEventId: string;
};

export const CalendarEventRecordingContent = ({
  calendarEventId,
}: CalendarEventRecordingContentProps) => {
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);

  const updateCurrentTimeSeconds = (videoCurrentTimeSeconds: number) => {
    const nextCurrentTimeSeconds =
      Math.floor(
        videoCurrentTimeSeconds / TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS,
      ) * TRANSCRIPT_TIME_UPDATE_INTERVAL_SECONDS;

    setCurrentTimeSeconds((previousCurrentTimeSeconds) =>
      previousCurrentTimeSeconds === nextCurrentTimeSeconds
        ? previousCurrentTimeSeconds
        : nextCurrentTimeSeconds,
    );
  };

  const {
    transcript,
    videoFile,
    isCalendarEventRecordingQueryLoading,
    errorMessage,
    refetchCalendarEventRecording,
  } = useCalendarEventRecording(calendarEventId);
  const { calendarEventParticipants } =
    useCalendarEventParticipants(calendarEventId);

  const handleVideoRetry = () => {
    setCurrentTimeSeconds(0);
    refetchCalendarEventRecording();
  };

  const videoFileUrl = videoFile?.url ?? undefined;

  const transcriptPlainText = useMemo(() => {
    const entries = parseTranscriptEntries(transcript);

    if (!isNonEmptyArray(entries)) {
      return undefined;
    }

    return buildTranscriptPlainText({ entries, calendarEventParticipants });
  }, [transcript, calendarEventParticipants]);

  return (
    <StyledRecordingShell>
      <StyledRecordingHeader>
        <StyledRecordingTitle>Recording and Transcript</StyledRecordingTitle>
        <StyledRecordingHeaderActions>
          <CopyToClipboardButton
            textToCopy={transcriptPlainText}
            ariaLabel="Copy transcript"
          />
          <CopyToClipboardButton
            textToCopy={videoFileUrl}
            ariaLabel="Copy video download link"
            Icon={IconLink}
          />
        </StyledRecordingHeaderActions>
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
            onVideoRetry={handleVideoRetry}
          />
        </StyledRecordingContentFrame>
      </StyledRecordingBody>
    </StyledRecordingShell>
  );
};
