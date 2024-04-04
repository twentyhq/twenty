import { gql } from '@apollo/client';

import { timelineCalendarEventFragment } from '@/activities/calendar/queries/fragments/timelineCalendarEventFragment';

export const timelineCalendarEventWithTotalFragment = gql`
  fragment TimelineCalendarEventsWithTotalFragment on TimelineCalendarEventsWithTotal {
    totalNumberOfCalendarEvents
    timelineCalendarEvents {
      ...TimelineCalendarEventFragment
    }
  }
  ${timelineCalendarEventFragment}
`;
