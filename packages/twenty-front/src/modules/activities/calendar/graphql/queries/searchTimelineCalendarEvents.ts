import { timelineCalendarEventFragment } from '@/activities/calendar/graphql/queries/fragments/timelineCalendarEventFragment';
import { gql } from '@apollo/client';

export const searchTimelineCalendarEvents = gql`
  query SearchTimelineCalendarEvents(
    $objectNameSingular: String!
    $recordId: UUID!
    $searchInput: String
    $limit: Int!
  ) {
    searchTimelineCalendarEvents(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      searchInput: $searchInput
      limit: $limit
    ) {
      recordTimelineCalendarEvents {
        ...TimelineCalendarEventFragment
      }
      otherTimelineCalendarEvents {
        ...TimelineCalendarEventFragment
      }
    }
  }
  ${timelineCalendarEventFragment}
`;
