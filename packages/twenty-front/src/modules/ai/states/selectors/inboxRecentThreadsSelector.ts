import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/InboxRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/ai/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/inboxThreadRecordFamilySelector';
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
