import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useProjectAiChatThreadToUrl } from '@/ai-chat/hooks/useProjectAiChatThreadToUrl';
import { useLoadAiChatThread } from '@/ai-chat/threads/hooks/useLoadAiChatThread';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { inboxRecentThreadsSelector } from '@/inbox/states/selectors/inboxRecentThreadsSelector';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { getCurrentAiChatPageThreadId } from '@/ai-chat/utils/getCurrentAiChatPageThreadId';
import { sortAiChatThreadsByLastActivityDesc } from '@/ai-chat/threads/utils/sortAiChatThreadsByLastActivityDesc';
import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';

export const useLeaveRemovedInboxThread = () => {
  const store = useStore();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();
  const { loadAiChatThread } = useLoadAiChatThread();

  const leaveRemovedInboxThread = useCallback(async () => {
    const currentThreadId = getCurrentAiChatPageThreadId(store);
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const threads = store.get(inboxRecentThreadsSelector.atom);

    if (
      !isDefined(currentThreadId) ||
      currentThreadId === newAiChatThreadId ||
      threads.some(({ id }) => id === currentThreadId)
    ) {
      return;
    }

    if (
      (await loadAiChatThread(currentThreadId)) !== null ||
      getCurrentAiChatPageThreadId(store) !== currentThreadId
    ) {
      return;
    }

    store.set(isWorkspaceSetupChatActiveState.atom, false);

    const nextThreadId =
      sortAiChatThreadsByLastActivityDesc(
        store.get(
          inboxThreadListThreadsFamilySelector.selectorFamily(
            store.get(inboxSelectedThreadListSourceState.atom),
          ),
        ),
      )[0]?.id ?? newAiChatThreadId;

    projectAiChatThreadToUrl(nextThreadId);
  }, [store, projectAiChatThreadToUrl, loadAiChatThread]);

  return { leaveRemovedInboxThread };
};
