import { timelineThreadWithTotalFragment } from '@/activities/emails/graphql/queries/fragments/timelineThreadWithTotalFragment';
import { gql } from '@apollo/client';

export const getTimelineThreadsFromCompanyId = gql`
  query GetTimelineThreadsFromCompanyId(
    $companyId: UUID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromCompanyId(
      companyId: $companyId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineThreadsWithTotalFragment
    }
  }
  ${timelineThreadWithTotalFragment}
`;
