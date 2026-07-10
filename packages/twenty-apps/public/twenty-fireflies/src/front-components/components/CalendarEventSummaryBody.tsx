import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SummaryMarkdown } from 'src/front-components/components/SummaryMarkdown';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';

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
