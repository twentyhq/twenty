import { timelineCalendarEventFragment } from '@/activities/calendar/graphql/queries/fragments/timelineCalendarEventFragment';
import { gql } from '@apollo/client';

export const searchTimelineCalendarEvents = gql`
  query SearchTimelineCalendarEvents(
    $objectNameSingular: String!
    $recordId: UUID!
    $searchInput: String
  ) {
    searchTimelineCalendarEvents(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      searchInput: $searchInput
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
