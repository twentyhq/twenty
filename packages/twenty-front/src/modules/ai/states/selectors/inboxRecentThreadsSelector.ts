import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/InboxRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/ai/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { isDefined } from 'twenty-shared/utils';

export const inboxRecentThreadsSelector = createAtomSelector<
  AiChatThreadRecord[]
>({
  key: 'inboxRecentThreadsSelector',
  get: ({ get }) =>
    (
      get(
        inboxThreadListFamilyState,
        getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
      )?.threadIds ?? []
    )
      .map((threadId) => get(aiChatThreadRecordFamilySelector, threadId))
      .filter(isDefined),
});
