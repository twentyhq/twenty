import { gql } from '@apollo/client';

export const ANSWER_AI_TASK_INPUT = gql`
  mutation AnswerAiTaskInput($input: AnswerAiTaskInputInput!) {
    answerAiTaskInput(input: $input) {
      requestedId
      isAvailable
      task
    }
  }
`;
