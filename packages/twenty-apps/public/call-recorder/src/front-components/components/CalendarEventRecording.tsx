import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import {
  useColorScheme,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';
import { ThemeProvider, themeCssVariables } from 'twenty-ui/theme-constants';

import { CalendarEventRecordingContent } from 'src/front-components/components/CalendarEventRecordingContent';

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  height: 100%;
  justify-content: center;
  padding: ${themeCssVariables.spacing['4']};
`;

export const CalendarEventRecording = () => {
  const colorScheme = useColorScheme();
  const selectedRecordIds = useSelectedRecordIds();
  const calendarEventId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  return (
    <ThemeProvider colorScheme={colorScheme}>
      {isUndefined(calendarEventId) ? (
        <StyledCenteredState>
          Open a calendar event to see its recording.
        </StyledCenteredState>
      ) : (
        <CalendarEventRecordingContent
          key={calendarEventId}
          calendarEventId={calendarEventId}
        />
      )}
    </ThemeProvider>
  );
};
