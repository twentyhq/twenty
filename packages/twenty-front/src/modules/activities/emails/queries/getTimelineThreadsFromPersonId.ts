import { gql } from '@apollo/client';

import { timelineThreadFragment } from '@/activities/emails/queries/fragments/timelineThreadFragment';

export const getTimelineThreadsFromPersonId = gql`
  query GetTimelineThreadsFromPersonId(
    $personId: ID!
    $page: Int!
    $pageSize: Int!
  ) {
    getTimelineThreadsFromPersonId(
      personId: $personId
      page: $page
      pageSize: $pageSize
    ) {
      ...TimelineThreadFragment
    }
  }
  ${timelineThreadFragment}
`;
