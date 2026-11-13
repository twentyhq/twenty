import { isDefined } from 'twenty-shared/utils';

import { inboxThreadMemberStateFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { type AiChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsAiChatThreadShownAsUnread = (
  thread: Pick<AiChatThreadRecord, 'id' | 'deletedAt'>,
) => {
  const { isUnread } = useAtomFamilySelectorValue(
    inboxThreadMemberStateFamilySelector,
    thread.id,
  );

  return !isDefined(thread.deletedAt) && isUnread;
};
