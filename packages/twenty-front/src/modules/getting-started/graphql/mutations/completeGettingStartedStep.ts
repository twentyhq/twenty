import { gql } from '@apollo/client';

import { GETTING_STARTED_PROGRESS_FRAGMENT } from '@/getting-started/graphql/fragments/gettingStartedProgressFragment';

export const COMPLETE_GETTING_STARTED_STEP = gql`
  ${GETTING_STARTED_PROGRESS_FRAGMENT}
  mutation CompleteGettingStartedStep(
    $input: CompleteGettingStartedStepInput!
  ) {
    completeGettingStartedStep(input: $input) {
      ...GettingStartedProgressFields
    }
  }
`;
