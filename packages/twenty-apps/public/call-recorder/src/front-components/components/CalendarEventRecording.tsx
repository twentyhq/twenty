import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';

import { CalendarEventRecordingContent } from 'src/front-components/components/CalendarEventRecordingContent';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

const StyledCenteredState = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${recordingThemeCssVariables.font.colorTertiary};
  display: flex;
  font-family: ${recordingThemeCssVariables.font.family};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  height: 100%;
  justify-content: center;
  padding: ${recordingThemeCssVariables.spacing[4]};
`;

export const CalendarEventRecording = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const calendarEventId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;

  if (isUndefined(calendarEventId)) {
    return (
      <StyledCenteredState>
        Open a calendar event to see its recording.
      </StyledCenteredState>
    );
  }

  return (
    <CalendarEventRecordingContent
      key={calendarEventId}
      calendarEventId={calendarEventId}
    />
  );
};
