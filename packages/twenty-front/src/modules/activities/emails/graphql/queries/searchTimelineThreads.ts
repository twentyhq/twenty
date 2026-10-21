import { timelineThreadFragment } from '@/activities/emails/graphql/queries/fragments/timelineThreadFragment';
import { gql } from '@apollo/client';

export const searchTimelineThreads = gql`
  query SearchTimelineThreads(
    $objectNameSingular: String!
    $recordId: UUID!
    $searchInput: String
    $limit: Int!
  ) {
    searchTimelineThreads(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      searchInput: $searchInput
      limit: $limit
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
