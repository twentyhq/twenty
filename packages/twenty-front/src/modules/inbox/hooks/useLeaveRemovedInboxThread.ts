import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useLoadAiChatThread } from '@/ai/hooks/useLoadAiChatThread';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { inboxRecentThreadsSelector } from '@/inbox/states/selectors/inboxRecentThreadsSelector';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { getAiChatPageThreadId } from '@/ai/utils/getAiChatPageThreadId';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

export const useLeaveRemovedInboxThread = () => {
  const store = useStore();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();
  const { loadAiChatThread } = useLoadAiChatThread();

  const leaveRemovedInboxThread = useCallback(async () => {
    const getOpenThreadId = () =>
      getAiChatPageThreadId({
        pathname: window.location.pathname,
        newAiChatThreadId: store.get(newAiChatThreadIdState.atom),
      });
    const currentThreadId = getOpenThreadId();
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
      getOpenThreadId() !== currentThreadId
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

    projectAiChatThreadToUrl(nextThreadId);
  }, [store, projectAiChatThreadToUrl, loadAiChatThread]);

  return { leaveRemovedInboxThread };
};
