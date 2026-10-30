import { gql } from '@apollo/client';

export const AI_TASK_STATES = gql`
  query AiTaskStates($input: AiTaskStatesInput!) {
    aiTaskStates(input: $input) {
      tasks {
        requestedId
        isAvailable
        task
      }
    }
  }
`;
