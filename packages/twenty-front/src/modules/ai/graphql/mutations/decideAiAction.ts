import { gql } from '@apollo/client';

export const DECIDE_AI_ACTION = gql`
  mutation DecideAiAction($input: DecideAiActionInput!) {
    decideAiAction(input: $input) {
      requestedId
      isAvailable
      action
    }
  }
`;
