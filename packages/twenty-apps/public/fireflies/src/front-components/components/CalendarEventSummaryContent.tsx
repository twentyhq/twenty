import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventSummaryBody } from 'src/front-components/components/CalendarEventSummaryBody';
import { useCalendarEventSummary } from 'src/front-components/hooks/use-calendar-event-summary';

// height: 100% fills the bounded box the solo canvas tab provides; in
// unbounded contexts (side panel, mobile column) it resolves to auto and the
// component flows with the page instead.
const StyledSummaryShell = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid transparent;
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  height: 100%;
  overflow: hidden;
  padding: ${() => themeCssVariables.spacing[4]};
  position: relative;
  width: 100%;
`;

const StyledSummaryHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${() => themeCssVariables.spacing[6]};
`;

const StyledSummaryTitle = styled.h2`
  color: ${() => themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${() => themeCssVariables.font.size.md};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin: 0;
  overflow: hidden;
  padding-inline: ${() => themeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledSummaryBody = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: ${() => themeCssVariables.spacing[2]};
  min-height: 0;
`;

// The frame is the only scroll region: the summary title stays pinned above
// while long content scrolls.
const StyledSummaryContentFrame = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: ${() => themeCssVariables.spacing[3]};
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
