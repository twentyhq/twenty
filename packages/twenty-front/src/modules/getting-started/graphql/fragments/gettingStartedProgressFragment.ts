import { gql } from '@apollo/client';

export const GETTING_STARTED_PROGRESS_FRAGMENT = gql`
  fragment GettingStartedProgressFields on GettingStartedProgress {
    steps {
      actionKey
      kind
      title
      doneTitle
      description
      doneDescription
      icon
      iconColor
      promptLabel
      prompt
      doneChatThreadId
    }
    completedStepActionKeys
    selectedStepActionKey
    snoozedUntil
    isHidden
  }
`;
