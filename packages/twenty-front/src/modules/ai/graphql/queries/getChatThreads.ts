import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadFragment';

export const GET_CHAT_THREADS = gql`
  ${AGENT_CHAT_THREAD_FRAGMENT}
  query GetChatThreads {
    chatThreads {
      ...AgentChatThreadFields
    }
  }
`;
