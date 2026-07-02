import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useSelectedRecordIds } from 'twenty-sdk/front-component';

import { CalendarEventRecordingContent } from 'src/front-components/components/CalendarEventRecordingContent';
import { CenteredState } from 'src/front-components/components/CenteredState';

const StyledCenteredState = styled(CenteredState)`
  height: 100%;
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
