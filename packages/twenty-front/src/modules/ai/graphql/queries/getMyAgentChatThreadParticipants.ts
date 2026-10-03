import { gql } from '@apollo/client';

import { AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT } from '@/ai/graphql/fragments/agentChatThreadParticipantFragment';

export const GET_MY_AGENT_CHAT_THREAD_PARTICIPANTS = gql`
  ${AGENT_CHAT_THREAD_PARTICIPANT_FRAGMENT}
  query GetMyAgentChatThreadParticipants($threadIds: [UUID!]!) {
    myAgentChatThreadParticipants(threadIds: $threadIds) {
      ...AgentChatThreadParticipantFields
    }
  }
`;
