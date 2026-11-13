import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/ai/states/agentChatThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getAgentChatThreadListSourceKey';
import { type InboxThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const inboxRecentThreadsSelector = createAtomSelector<
  InboxThreadRecord[]
>({
  key: 'inboxRecentThreadsSelector',
  get: ({ get }) =>
    (
      get(
        inboxThreadListFamilyState,
        getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
      )?.threadIds ?? []
    )
      .map((threadId) => get(inboxThreadRecordFamilySelector, threadId))
      .filter(isDefined),
});
