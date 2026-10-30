import { gql } from '@apollo/client';

export const CANCEL_AI_TASK = gql`
  mutation CancelAiTask($input: CancelAiTaskInput!) {
    cancelAiTask(input: $input) {
      requestedId
      isAvailable
      task
    }
  }
`;
