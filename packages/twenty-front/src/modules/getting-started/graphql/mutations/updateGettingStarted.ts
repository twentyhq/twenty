import { gql } from '@apollo/client';

import { GETTING_STARTED_PROGRESS_FRAGMENT } from '@/getting-started/graphql/fragments/gettingStartedProgressFragment';

export const UPDATE_GETTING_STARTED = gql`
  ${GETTING_STARTED_PROGRESS_FRAGMENT}
  mutation UpdateGettingStarted($input: UpdateGettingStartedInput!) {
    updateGettingStarted(input: $input) {
      ...GettingStartedProgressFields
    }
  }
`;
