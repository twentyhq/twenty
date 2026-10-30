import { gql } from '@apollo/client';

export const RETRY_AI_TASK_STEP = gql`
  mutation RetryAiTaskStep($input: RetryAiTaskStepInput!) {
    retryAiTaskStep(input: $input) {
      requestedId
      isAvailable
      task
    }
  }
`;
