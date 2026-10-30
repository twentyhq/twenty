import { gql } from '@apollo/client';

export const REVISE_AI_ACTION = gql`
  mutation ReviseAiAction($input: ReviseAiActionInput!) {
    reviseAiAction(input: $input) {
      requestedId
      isAvailable
      action
    }
  }
`;
