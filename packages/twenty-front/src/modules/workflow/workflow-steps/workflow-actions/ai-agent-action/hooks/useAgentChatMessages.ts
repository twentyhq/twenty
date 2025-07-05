import { useQuery } from '@tanstack/react-query';
import { isDefined } from 'twenty-shared/utils';
import {
  agentChatApi,
  agentChatKeys,
  AgentChatMessage,
} from '../api/agent-chat.api';

export const useAgentChatMessages = (
  threadId: string,
  onSuccess: (data: AgentChatMessage[]) => void,
) => {
  return useQuery({
    queryKey: agentChatKeys.messages(threadId),
    queryFn: async () => {
      const response = await agentChatApi.getMessages(threadId);
      onSuccess(response);
      return response;
    },
    enabled: isDefined(threadId),
  });
};
