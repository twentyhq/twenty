import { useCallback } from 'react';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/InboxRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/ai/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
import { inboxThreadRecordUpdateCountState } from '@/ai/states/inboxThreadRecordUpdateCountState';
import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { useStore } from 'jotai';

type InboxThreadUpdate = Partial<InboxThreadRecord> & {
  id: string;
};

export const useApplyInboxThreadUpdate = () => {
  const store = useStore();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  // A list page requested before this update must not overwrite it
  const applyInboxThreadUpdate = useCallback(
    (update: InboxThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...update }],
      });
      store.set(
        inboxThreadRecordUpdateCountState.atom,
        (updateCount) => updateCount + 1,
      );
    },
    [store, upsertRecordsInStore],
  );

  const prependInboxThreadToList = useCallback(
    (threadId: string) => {
      const recentThreadListAtom = inboxThreadListFamilyState.atomFamily(
        getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
      );
      const inboxThreadList = store.get(recentThreadListAtom);

      if (
        inboxThreadList === null ||
        inboxThreadList.threadIds.includes(threadId)
      ) {
        return;
      }

      store.set(recentThreadListAtom, {
        ...inboxThreadList,
        threadIds: [threadId, ...inboxThreadList.threadIds],
      });
    },
    [store],
  );

  const addInboxThread = useCallback(
    (thread: InboxThreadUpdate) => {
      applyInboxThreadUpdate(thread);
      prependInboxThreadToList(thread.id);
    },
    [applyInboxThreadUpdate, prependInboxThreadToList],
  );

  const addLoadedInboxThread = useCallback(
    (thread: InboxThreadUpdate) => {
      upsertRecordsInStore({
        partialRecords: [{ __typename: 'AgentChatThread', ...thread }],
      });
      prependInboxThreadToList(thread.id);
    },
    [prependInboxThreadToList, upsertRecordsInStore],
  );

  return {
    applyInboxThreadUpdate,
    addInboxThread,
    addLoadedInboxThread,
  };
};
