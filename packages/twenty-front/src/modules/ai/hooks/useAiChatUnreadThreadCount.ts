import { agentChatUnreadThreadIdsState } from '@/ai/states/agentChatUnreadThreadIdsState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useAiChatUnreadThreadCount = (
  threads: FlatAgentChatThread[],
): number => {
  const agentChatUnreadThreadIds = useAtomStateValue(
    agentChatUnreadThreadIdsState,
  );

  return threads.filter((thread) =>
    agentChatUnreadThreadIds.includes(thread.id),
  ).length;
};
