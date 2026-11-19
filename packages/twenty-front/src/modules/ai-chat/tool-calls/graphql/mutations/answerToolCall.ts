import { gql } from '@apollo/client';

export const ANSWER_TOOL_CALL = gql`
  mutation AnswerToolCall($input: AnswerToolCallInput!) {
    answerToolCall(input: $input) {
      streamId
    }
  }
`;
