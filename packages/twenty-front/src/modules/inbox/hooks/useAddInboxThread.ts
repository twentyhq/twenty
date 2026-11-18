import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { prependInboxThreadListThreadId } from '@/inbox/utils/prependInboxThreadListThreadId';

export const useAddInboxThread = () => {
  const store = useStore();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();

  const prependInboxThreadToRecentList = useCallback(
    (threadId: string) => {
      const recentThreadListAtom = inboxThreadListFamilyState.atomFamily(
        getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
      );
      const inboxThreadList = store.get(recentThreadListAtom);

      if (!isDefined(inboxThreadList)) {
        return;
      }

      store.set(
        recentThreadListAtom,
        prependInboxThreadListThreadId({ inboxThreadList, threadId }),
      );
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
