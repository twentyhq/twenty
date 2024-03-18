import { gql } from '@apollo/client';

import { calendarEventFragment } from '@/activities/calendar/queries/fragments/calendarEventFragment';

export const timelineCalendarEventWithTotalFragment = gql`
  fragment TimelineCalendarEventsWithTotalFragment on TimelineCalendarEventsWithTotal {
    totalNumberOfCalendarEvents
    timelineCalendarEvents {
      ...CalendarEventFragment
    }
  }
  ${calendarEventFragment}
`;
