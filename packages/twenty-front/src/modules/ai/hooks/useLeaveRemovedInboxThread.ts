import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useProjectInboxThreadToUrl } from '@/ai/hooks/useProjectInboxThreadToUrl';
import { useLoadInboxThread } from '@/ai/hooks/useLoadInboxThread';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { inboxRecentThreadsSelector } from '@/ai/states/selectors/inboxRecentThreadsSelector';
import { inboxSelectedThreadListSourceState } from '@/ai/states/inboxSelectedThreadListSourceState';
import { inboxThreadListThreadsFamilySelector } from '@/ai/states/selectors/inboxThreadListThreadsFamilySelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { shouldOpenInboxAfterOnboardingState } from '@/onboarding/states/shouldOpenInboxAfterOnboardingState';

export const useLeaveRemovedInboxThread = () => {
  const store = useStore();
  const { projectInboxThreadToUrl } = useProjectInboxThreadToUrl({
    shouldPreserveClosedInbox: true,
  });
  const { loadInboxThread } = useLoadInboxThread();

  const leaveRemovedInboxThread = useCallback(async () => {
    const currentThreadId = store.get(currentInboxThreadState.atom);
    const newInboxThreadId = store.get(newInboxThreadIdState.atom);
    const threads = store.get(inboxRecentThreadsSelector.atom);

    if (
      !isDefined(currentThreadId) ||
      currentThreadId === newInboxThreadId ||
      threads.some(({ id }) => id === currentThreadId)
    ) {
      return;
    }

    // Only the first page is reloaded, so an older chat is looked up first
    if (
      (await loadInboxThread(currentThreadId)) !== null ||
      store.get(currentInboxThreadState.atom) !== currentThreadId
    ) {
      return;
    }

    store.set(shouldOpenInboxAfterOnboardingState.atom, false);

    const nextThreadId =
      sortChatThreadsByLastActivityDesc(
        store.get(
          inboxThreadListThreadsFamilySelector.selectorFamily(
            store.get(inboxSelectedThreadListSourceState.atom),
          ),
        ),
      )[0]?.id ?? newInboxThreadId;
    store.set(currentInboxThreadState.atom, nextThreadId);
    projectInboxThreadToUrl(nextThreadId);
  }, [store, projectInboxThreadToUrl, loadInboxThread]);

  return { leaveRemovedInboxThread };
};
