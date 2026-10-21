import { timelineThreadFragment } from '@/activities/emails/graphql/queries/fragments/timelineThreadFragment';
import { gql } from '@apollo/client';

export const searchTimelineThreads = gql`
  query SearchTimelineThreads(
    $objectNameSingular: String!
    $recordId: UUID!
    $searchInput: String
  ) {
    searchTimelineThreads(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      searchInput: $searchInput
    ) {
      recordTimelineThreads {
        ...TimelineThreadFragment
      }
      otherTimelineThreads {
        ...TimelineThreadFragment
      }
    }
  }
  ${timelineThreadFragment}
`;
