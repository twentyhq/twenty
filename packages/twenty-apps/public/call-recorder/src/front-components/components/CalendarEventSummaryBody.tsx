import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';

import { CenteredState } from 'src/front-components/components/CenteredState';
import { SummaryMarkdown } from 'src/front-components/components/SummaryMarkdown';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';

const StyledCenteredState = styled(CenteredState)`
  min-height: 240px;
`;

type CalendarEventSummaryBodyProps = {
  summaryMarkdown: string | undefined;
  isCalendarEventSummaryQueryLoading: boolean;
  errorMessage: string | undefined;
};

export const CalendarEventSummaryBody = ({
  summaryMarkdown,
  isCalendarEventSummaryQueryLoading,
  errorMessage,
}: CalendarEventSummaryBodyProps) => {
  if (!isUndefined(errorMessage)) {
    return (
      <TranscriptErrorBox
        title="Failed to load the summary"
        description={errorMessage}
      />
    );
  }

  if (isCalendarEventSummaryQueryLoading) {
    return <StyledCenteredState>Loading summary…</StyledCenteredState>;
  }

  if (isUndefined(summaryMarkdown)) {
    return (
      <StyledCenteredState>
        No summary for this calendar event yet.
      </StyledCenteredState>
    );
  }

  return <SummaryMarkdown markdown={summaryMarkdown} />;
};
