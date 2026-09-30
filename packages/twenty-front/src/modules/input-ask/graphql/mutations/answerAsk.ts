import { gql } from '@apollo/client';

export const ANSWER_ASK = gql`
  mutation AnswerAsk($input: AnswerAskInput!) {
    answerAsk(input: $input) {
      streamId
    }
  }
`;
