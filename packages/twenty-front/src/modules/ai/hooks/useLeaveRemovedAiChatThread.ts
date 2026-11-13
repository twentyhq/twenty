import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useLoadAgentChatThread } from '@/ai/hooks/useLoadAgentChatThread';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { agentChatRecentThreadsSelector } from '@/ai/states/selectors/agentChatRecentThreadsSelector';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { agentChatThreadListThreadsFamilySelector } from '@/ai/states/selectors/agentChatThreadListThreadsFamilySelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

export const useLeaveRemovedAiChatThread = () => {
  const store = useStore();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl({
    shouldPreserveClosedInbox: true,
  });
  const { loadAgentChatThread } = useLoadAgentChatThread();

  const leaveRemovedAiChatThread = useCallback(async () => {
    const currentThreadId = store.get(currentAiChatThreadState.atom);
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const threads = store.get(agentChatRecentThreadsSelector.atom);

    if (
      !isDefined(currentThreadId) ||
      currentThreadId === newAiChatThreadId ||
      threads.some(({ id }) => id === currentThreadId)
    ) {
      return;
    }

    // Only the first page is reloaded, so an older chat is looked up first
    if (
      (await loadAgentChatThread(currentThreadId)) !== null ||
      store.get(currentAiChatThreadState.atom) !== currentThreadId
    ) {
      return;
    }

    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    const nextThreadId =
      sortChatThreadsByLastActivityDesc(
        store.get(
          agentChatThreadListThreadsFamilySelector.selectorFamily(
            store.get(agentChatSelectedThreadListSourceState.atom),
          ),
        ),
      )[0]?.id ?? newAiChatThreadId;
    store.set(currentAiChatThreadState.atom, nextThreadId);
    projectAiChatThreadToUrl(nextThreadId);
  }, [store, projectAiChatThreadToUrl, loadAgentChatThread]);

  return { leaveRemovedAiChatThread };
};
