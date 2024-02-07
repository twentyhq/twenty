import { gql } from '@apollo/client';

import { timelineThreadFragment } from '@/activities/emails/queries/fragments/timelineThreadFragment';

export const timelineThreadWithTotalFragment = gql`
  fragment TimelineThreadsWithTotalFragment on TimelineThreadsWithTotal {
    totalNumberOfThreads
    timelineThreads {
      ...TimelineThreadFragment
    }
  }
  ${timelineThreadFragment}
`;
