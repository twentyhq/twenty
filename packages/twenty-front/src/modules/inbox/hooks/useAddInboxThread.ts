import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useApplyAiChatThreadUpdate } from '@/ai/hooks/useApplyAiChatThreadUpdate';
import { type AiChatThreadRecord } from '@/ai/types/AiChatThreadRecord';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';

export const useAddInboxThread = () => {
  const store = useStore();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();

  const prependInboxThreadToRecentList = useCallback(
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
    (thread: Partial<AiChatThreadRecord> & { id: string }) => {
      applyAiChatThreadUpdate(thread);
      prependInboxThreadToRecentList(thread.id);
    },
    [applyAiChatThreadUpdate, prependInboxThreadToRecentList],
  );

  return { addInboxThread, prependInboxThreadToRecentList };
};
