import { gql } from '@apollo/client';

import { participantFragment } from '@/activities/emails/queries/fragments/participantFragment';

export const timelineThreadFragmentWithTotal = gql`
  fragment TimelineThreadsWithTotalFragment on TimelineThreadsWithTotal {
    totalNumberOfThreads
    timelineThreads {
      ...TimelineThreadFragment
    }
  }
  ${participantFragment}
`;
