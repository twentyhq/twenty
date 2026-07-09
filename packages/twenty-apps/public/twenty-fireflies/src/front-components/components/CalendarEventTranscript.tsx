import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventTranscriptContent } from 'src/front-components/components/CalendarEventTranscriptContent';

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  height: 100%;
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[4]};
`;

export const CalendarEventTranscript = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const calendarEventId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  if (isUndefined(calendarEventId)) {
    return (
      <StyledCenteredState>
        Open a calendar event to see its transcript.
      </StyledCenteredState>
    );
  }

  return (
    <CalendarEventTranscriptContent
      key={calendarEventId}
      calendarEventId={calendarEventId}
    />
  );
};
