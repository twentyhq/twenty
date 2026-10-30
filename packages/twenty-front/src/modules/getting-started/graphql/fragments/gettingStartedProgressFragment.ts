import { gql } from '@apollo/client';

export const GETTING_STARTED_PROGRESS_FRAGMENT = gql`
  fragment GettingStartedProgressFields on GettingStartedProgress {
    steps {
      step
      kind
      title
      doneTitle
      description
      icon
      iconColor
      promptLabel
      prompt
    }
    completedSteps
    selectedStep
    snoozedUntil
    isHidden
  }
`;
