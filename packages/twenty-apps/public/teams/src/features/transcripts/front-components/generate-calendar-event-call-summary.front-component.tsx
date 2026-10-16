import { defineFrontComponent } from 'twenty-sdk/define';
import { Command, useSelectedRecordIds } from 'twenty-sdk/front-component';

import { TEAMS_GENERATE_CALENDAR_EVENT_CALL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';
import { requestTeamsCallSummaries } from 'src/features/transcripts/front-components/utils/request-teams-call-summaries';

const GenerateCalendarEventCallSummary = () => {
  const calendarEventIds = useSelectedRecordIds();

  return (
    <Command execute={() => requestTeamsCallSummaries({ calendarEventIds })} />
  );
};

export default defineFrontComponent({
  universalIdentifier:
    TEAMS_GENERATE_CALENDAR_EVENT_CALL_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'generate-calendar-event-call-summary',
  description:
    'Writes or rewrites the AI summary of the Microsoft Teams Call Recordings of the selected calendar events.',
  component: GenerateCalendarEventCallSummary,
  isHeadless: true,
});
