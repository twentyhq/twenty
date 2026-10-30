import { gql } from '@apollo/client';

import { GETTING_STARTED_PROGRESS_FRAGMENT } from '@/getting-started/graphql/fragments/gettingStartedProgressFragment';

export const GETTING_STARTED_PROGRESS = gql`
  ${GETTING_STARTED_PROGRESS_FRAGMENT}
  query GettingStartedProgress {
    gettingStartedProgress {
      ...GettingStartedProgressFields
    }
  }
`;
