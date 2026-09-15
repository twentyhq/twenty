import { timelineCalendarEventWithTotalFragment } from '@/activities/calendar/graphql/queries/fragments/timelineCalendarEventWithTotalFragment';
import { gql } from '@apollo/client';

export const getTimelineCalendarEventsFromObjectRecord = gql`
  query GetTimelineCalendarEventsFromObjectRecord(
    $objectNameSingular: String!
    $recordId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineCalendarEventsFromObjectRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineCalendarEventsWithTotalFragment
    }
  }
  ${timelineCalendarEventWithTotalFragment}
`;
