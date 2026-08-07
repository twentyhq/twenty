import styled from '@emotion/styled';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventTranscriptBody } from 'src/front-components/components/CalendarEventTranscriptBody';
import { useCalendarEventTranscript } from 'src/front-components/hooks/use-calendar-event-transcript';

const StyledTranscriptShell = styled.div`
  background: ${() => themeCssVariables.background.primary};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${() => themeCssVariables.font.family};
  height: 100%;
  padding: ${() => themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledTranscriptHeader = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  height: ${() => themeCssVariables.spacing[6]};
`;

const StyledTranscriptTitle = styled.h2`
  color: ${() => themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${() => themeCssVariables.font.size.md};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin: 0;
  overflow: hidden;
  padding-inline: ${() => themeCssVariables.spacing[1]};
  user-select: none;
`;

const StyledTranscriptBody = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  margin-top: ${() => themeCssVariables.spacing[2]};
  min-height: 0;
`;

const StyledTranscriptContentFrame = styled.div`
  background-color: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: ${() => themeCssVariables.spacing[3]};
`;

type CalendarEventTranscriptContentProps = {
  calendarEventId: string;
};

export const CalendarEventTranscriptContent = ({
  calendarEventId,
}: CalendarEventTranscriptContentProps) => {
  const { transcript, isCalendarEventTranscriptQueryLoading, errorMessage } =
    useCalendarEventTranscript(calendarEventId);

  return (
    <StyledTranscriptShell>
      <StyledTranscriptHeader>
        <StyledTranscriptTitle>Transcript</StyledTranscriptTitle>
      </StyledTranscriptHeader>
      <StyledTranscriptBody>
        <StyledTranscriptContentFrame>
          <CalendarEventTranscriptBody
            transcript={transcript}
            isCalendarEventTranscriptQueryLoading={
              isCalendarEventTranscriptQueryLoading
            }
            errorMessage={errorMessage}
          />
        </StyledTranscriptContentFrame>
      </StyledTranscriptBody>
    </StyledTranscriptShell>
  );
};
