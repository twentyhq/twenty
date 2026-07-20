import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventSummaryBody } from 'src/front-components/components/CalendarEventSummaryBody';
import { CopyToClipboardButton } from 'src/front-components/components/CopyToClipboardButton';
import { useCalendarEventSummary } from 'src/front-components/hooks/use-calendar-event-summary';

const StyledSummaryShell = styled.div`
  background: ${() => themeCssVariables.background.primary};
  border: 1px solid transparent;
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  font-family: ${() => themeCssVariables.font.family};
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
  margin-top: ${() => themeCssVariables.spacing[2]};
`;

const StyledSummaryContentFrame = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
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
        <CopyToClipboardButton
          textToCopy={summaryMarkdown}
          ariaLabel="Copy summary"
        />
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
