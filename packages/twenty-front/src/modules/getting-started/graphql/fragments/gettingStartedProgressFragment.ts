import { gql } from '@apollo/client';

export const GETTING_STARTED_PROGRESS_FRAGMENT = gql`
  fragment GettingStartedProgressFields on GettingStartedProgress {
    creditsEarned
    steps {
      key
      kind
      permissionFlag
    }
    completedSteps
    selectedStep
    snoozedUntil
  }
`;
