import { timelineCalendarEventFragment } from '@/activities/calendar/graphql/queries/fragments/timelineCalendarEventFragment';
import { gql } from '@apollo/client';

export const timelineCalendarEventWithTotalFragment = gql`
  fragment TimelineCalendarEventsWithTotalFragment on TimelineCalendarEventsWithTotal {
    totalNumberOfCalendarEvents
    timelineCalendarEvents {
      ...TimelineCalendarEventFragment
    }
  }
  ${timelineCalendarEventFragment}
`;
