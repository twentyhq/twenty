import { agentChatUnreadThreadIdsState } from '@/ai/states/agentChatUnreadThreadIdsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useIsAiChatThreadUnread = (threadId: string): boolean => {
  const agentChatUnreadThreadIds = useAtomStateValue(
    agentChatUnreadThreadIdsState,
  );

  return agentChatUnreadThreadIds.includes(threadId);
};
