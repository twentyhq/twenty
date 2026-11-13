import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useLoadAiChatThread } from '@/ai/hooks/useLoadAiChatThread';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { inboxRecentThreadsSelector } from '@/inbox/states/selectors/inboxRecentThreadsSelector';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

export const useLeaveRemovedAiChatThread = () => {
  const store = useStore();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl({
    shouldPreserveClosedInbox: true,
  });
  const { loadAiChatThread } = useLoadAiChatThread();

  const leaveRemovedAiChatThread = useCallback(async () => {
    const currentThreadId = store.get(currentAiChatThreadState.atom);
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const threads = store.get(inboxRecentThreadsSelector.atom);

    if (
      !isDefined(currentThreadId) ||
      currentThreadId === newAiChatThreadId ||
      threads.some(({ id }) => id === currentThreadId)
    ) {
      return;
    }

    // Only the first page is reloaded, so an older chat is looked up first
    if (
      (await loadAiChatThread(currentThreadId)) !== null ||
      store.get(currentAiChatThreadState.atom) !== currentThreadId
    ) {
      return;
    }

    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    const nextThreadId =
      sortChatThreadsByLastActivityDesc(
        store.get(
          inboxThreadListThreadsFamilySelector.selectorFamily(
            store.get(inboxSelectedThreadListSourceState.atom),
          ),
        ),
      )[0]?.id ?? newAiChatThreadId;
    store.set(currentAiChatThreadState.atom, nextThreadId);
    projectAiChatThreadToUrl(nextThreadId);
  }, [store, projectAiChatThreadToUrl, loadAiChatThread]);

  return { leaveRemovedAiChatThread };
};
