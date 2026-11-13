import { isDefined } from 'twenty-shared/utils';

import { inboxThreadMemberStateFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

export const useIsInboxThreadShownAsUnread = (
  thread: Pick<InboxThreadRecord, 'id' | 'deletedAt'>,
) => {
  const { isUnread } = useAtomFamilySelectorValue(
    inboxThreadMemberStateFamilySelector,
    thread.id,
  );

  return !isDefined(thread.deletedAt) && isUnread;
};
