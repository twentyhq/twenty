import { useQuery } from '@tanstack/react-query';
import { isDefined } from 'twenty-shared/utils';
import { agentChatApi, agentChatKeys } from '../api/agent-chat.api';

export const useAgentChatThreads = (agentId: string) => {
  return useQuery({
    queryKey: agentChatKeys.threads(agentId),
    queryFn: () => agentChatApi.getThreads(agentId),
    enabled: isDefined(agentId),
  });
};
