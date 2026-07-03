import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';

import { SummaryMarkdown } from 'src/front-components/components/SummaryMarkdown';
import { TranscriptErrorBox } from 'src/front-components/components/TranscriptErrorBox';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

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
