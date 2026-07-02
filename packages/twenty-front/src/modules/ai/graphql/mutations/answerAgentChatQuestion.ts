import { gql } from '@apollo/client';

export const ANSWER_AGENT_CHAT_QUESTION = gql`
  mutation AnswerAgentChatQuestion(
    $threadId: UUID!
    $messageId: UUID!
    $answers: [AgentChatQuestionAnswerInput!]!
    $modelId: String
  ) {
    answerAgentChatQuestion(
      threadId: $threadId
      messageId: $messageId
      answers: $answers
      modelId: $modelId
    ) {
      messageId
      queued
      streamId
    }
  }
`;
