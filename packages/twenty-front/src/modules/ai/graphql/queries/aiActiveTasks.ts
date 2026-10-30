import { gql } from '@apollo/client';

export const AI_ACTIVE_TASKS = gql`
  query AiActiveTasks {
    aiActiveTasks {
      threadId
      task
    }
  }
`;
