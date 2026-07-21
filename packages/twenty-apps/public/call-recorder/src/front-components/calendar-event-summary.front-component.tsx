import { defineFrontComponent } from 'twenty-sdk/define';

import { CALENDAR_EVENT_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/calendar-event-summary-front-component-universal-identifier';
import { CalendarEventSummary } from 'src/front-components/components/CalendarEventSummary';

export default defineFrontComponent({
  universalIdentifier:
    CALENDAR_EVENT_SUMMARY_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'calendar-event-summary',
  description:
    'Read-only AI summary viewer for the calendar event record page.',
  component: CalendarEventSummary,
});
