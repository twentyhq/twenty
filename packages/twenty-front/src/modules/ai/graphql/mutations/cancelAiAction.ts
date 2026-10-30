import { gql } from '@apollo/client';

export const CANCEL_AI_ACTION = gql`
  mutation CancelAiAction($input: CancelAiActionInput!) {
    cancelAiAction(input: $input) {
      requestedId
      isAvailable
      action
    }
  }
`;
