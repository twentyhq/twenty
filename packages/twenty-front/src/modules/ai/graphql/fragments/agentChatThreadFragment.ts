import { gql } from '@apollo/client';

export const AGENT_CHAT_THREAD_FRAGMENT = gql`
  fragment AgentChatThreadFields on AgentChatThread {
    id
    title
    totalCacheReadTokens
    totalInputTokens
    totalOutputTokens
    contextWindowTokens
    conversationSize
    totalInputCredits
    totalOutputCredits
    deletedAt
    lastMessageAt
    createdAt
    updatedAt
  }
`;
