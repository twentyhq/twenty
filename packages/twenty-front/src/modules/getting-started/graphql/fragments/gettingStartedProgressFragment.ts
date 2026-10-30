import { gql } from '@apollo/client';

export const GETTING_STARTED_PROGRESS_FRAGMENT = gql`
  fragment GettingStartedProgressFields on GettingStartedProgress {
    steps {
      actionKey
      kind
      title
      doneTitle
      description
      icon
      iconColor
      promptLabel
      prompt
    }
    completedStepActionKeys
    selectedStepActionKey
    snoozedUntil
    isHidden
  }
`;
