import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useMemo } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TranscriptEntryList } from 'src/front-components/components/TranscriptEntryList';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';
import { parseTranscriptEntries } from 'src/front-components/utils/parse-transcript-entries.util';

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  flex: 1;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  justify-content: center;
  min-height: 240px;
  padding: ${() => themeCssVariables.spacing[4]};
`;

type CalendarEventTranscriptBodyProps = {
  transcript: unknown;
  isCalendarEventTranscriptQueryLoading: boolean;
  errorMessage: string | undefined;
};

export const CalendarEventTranscriptBody = ({
  transcript,
  isCalendarEventTranscriptQueryLoading,
  errorMessage,
}: CalendarEventTranscriptBodyProps) => {
  const entries = useMemo(
    () => parseTranscriptEntries(transcript),
    [transcript],
  );

  if (!isUndefined(errorMessage)) {
    return (
      <TranscriptErrorBox
        title="Failed to load the transcript"
        description={errorMessage}
      />
    );
  }

  if (isCalendarEventTranscriptQueryLoading) {
    return <StyledCenteredState>Loading transcript…</StyledCenteredState>;
  }

  if (isUndefined(transcript)) {
    return (
      <StyledCenteredState>
        No transcript for this calendar event yet.
      </StyledCenteredState>
    );
  }

  if (isUndefined(entries)) {
    return (
      <TranscriptErrorBox
        title="Unrecognized transcript format"
        description="The stored transcript does not match the expected diarized format."
      />
    );
  }

  if (entries.length === 0) {
    return <StyledCenteredState>The transcript is empty.</StyledCenteredState>;
  }

  return <TranscriptEntryList entries={entries} />;
};
