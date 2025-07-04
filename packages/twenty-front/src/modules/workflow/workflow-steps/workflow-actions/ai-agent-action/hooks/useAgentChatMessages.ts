import { useQuery } from '@tanstack/react-query';
import { agentChatApi, agentChatKeys } from '../api/agent-chat.api';

export const useAgentChatMessages = (threadId: string) => {
  return useQuery({
    queryKey: agentChatKeys.messages(threadId),
    queryFn: () => agentChatApi.getMessages(threadId),
    enabled: !!threadId,
  });
};
