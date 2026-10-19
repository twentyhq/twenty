import { gql } from '@apollo/client';

export const GET_GETTING_STARTED_PROGRESS = gql`
  query GettingStartedProgress {
    gettingStartedProgress {
      creditsEarned
      completedSteps
      selectedStep
      snoozedUntil
    }
  }
`;

export const UPDATE_GETTING_STARTED = gql`
  mutation UpdateGettingStarted($input: UpdateGettingStartedInput!) {
    updateGettingStarted(input: $input) {
      creditsEarned
      completedSteps
      selectedStep
      snoozedUntil
    }
  }
`;

export const PREPARE_HANDOVER = gql`
  mutation PrepareGettingStartedHandover($activate: Boolean!) {
    prepareGettingStartedHandover(activate: $activate) {
      workflowId
      versionId
    }
  }
`;
