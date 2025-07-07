import { useQuery } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { GET_AGENT_CHAT_THREADS } from '../api/agent-chat-apollo.api';

export interface AgentChatThread {
  id: string;
  agentId: string;
  createdAt: string;
  updatedAt: string;
}

export const useAgentChatThreads = (agentId: string) => {
  return useQuery<{ threads: AgentChatThread[] }>(GET_AGENT_CHAT_THREADS, {
    variables: { agentId },
    skip: !isDefined(agentId),
  });
};
