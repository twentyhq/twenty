import styled from '@emotion/styled';

import { CalendarEventSummaryBody } from 'src/front-components/components/CalendarEventSummaryBody';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { useCalendarEventSummary } from 'src/front-components/hooks/use-calendar-event-summary';

const StyledSummaryShell = styled.div`
  background: ${recordingThemeCssVariables.background.primary};
  border: 1px solid transparent;
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  box-sizing: border-box;
  font-family: ${recordingThemeCssVariables.font.family};
  padding: ${recordingThemeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledSummaryHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${recordingThemeCssVariables.spacing[6]};
`;

const StyledSummaryTitle = styled.h2`
  color: ${recordingThemeCssVariables.font.colorPrimary};
  flex: 1;
  font-size: ${recordingThemeCssVariables.font.sizeMd};
  font-weight: ${recordingThemeCssVariables.font.weightMedium};
  margin: 0;
  overflow: hidden;
  padding-inline: ${recordingThemeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledSummaryBody = styled.div`
  box-sizing: border-box;
  margin-top: ${recordingThemeCssVariables.spacing[2]};
`;

const StyledSummaryContentFrame = styled.div`
  background-color: ${recordingThemeCssVariables.background.secondary};
  border: 1px solid ${recordingThemeCssVariables.border.colorMedium};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  box-sizing: border-box;
  padding: ${recordingThemeCssVariables.spacing[3]};
`;

type CalendarEventSummaryContentProps = {
  calendarEventId: string;
};

export const CalendarEventSummaryContent = ({
  calendarEventId,
}: CalendarEventSummaryContentProps) => {
  const { summaryMarkdown, isCalendarEventSummaryQueryLoading, errorMessage } =
    useCalendarEventSummary(calendarEventId);

  return (
    <StyledSummaryShell>
      <StyledSummaryHeader>
        <StyledSummaryTitle>Summary</StyledSummaryTitle>
      </StyledSummaryHeader>
      <StyledSummaryBody>
        <StyledSummaryContentFrame>
          <CalendarEventSummaryBody
            summaryMarkdown={summaryMarkdown}
            isCalendarEventSummaryQueryLoading={
              isCalendarEventSummaryQueryLoading
            }
            errorMessage={errorMessage}
          />
        </StyledSummaryContentFrame>
      </StyledSummaryBody>
    </StyledSummaryShell>
  );
};
