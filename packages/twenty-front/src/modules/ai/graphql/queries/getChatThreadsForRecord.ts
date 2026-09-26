import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadFragment';

export const GET_CHAT_THREADS_FOR_RECORD = gql`
  ${AGENT_CHAT_THREAD_FRAGMENT}
  query GetChatThreadsForRecord(
    $objectNameSingular: String!
    $recordId: UUID!
    $limit: Int!
  ) {
    chatThreadsForRecord(
      objectNameSingular: $objectNameSingular
      recordId: $recordId
      limit: $limit
    ) {
      ...AgentChatThreadFields
    }
  }
`;
