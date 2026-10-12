import { isDefined } from 'twenty-shared/utils';

import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsAgentChatThreadShownAsUnread = (
  thread: Pick<AgentChatThreadRecord, 'id' | 'deletedAt'>,
) => {
  const { isUnread } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    thread.id,
  );

  return !isDefined(thread.deletedAt) && isUnread;
};
