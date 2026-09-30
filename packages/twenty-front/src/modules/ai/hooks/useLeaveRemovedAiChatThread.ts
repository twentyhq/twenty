import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  isDefined,
  isValidUuid,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';

import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { shouldOpenAiChatAfterOnboardingState } from '@/onboarding/states/shouldOpenAiChatAfterOnboardingState';

export const useLeaveRemovedAiChatThread = () => {
  const store = useStore();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl();

  const leaveRemovedAiChatThread = useCallback(() => {
    const currentThreadId = store.get(currentAiChatThreadState.atom);
    const threads = store.get(metadataStoreState.atomFamily('agentChatThreads'))
      .current as FlatAgentChatThread[];

    if (
      !isDefined(currentThreadId) ||
      !isValidUuid(currentThreadId) ||
      threads.some(({ id }) => id === currentThreadId)
    ) {
      return;
    }

    store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

    const nextThreadId =
      sortChatThreadsByLastActivityDesc(
        store.get(agentChatVisibleThreadsSelector.atom),
      )[0]?.id ?? AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
    const draftsByThreadId = store.get(agentChatDraftsByThreadIdState.atom);

    store.set(currentAiChatThreadState.atom, nextThreadId);
    projectAiChatThreadToUrl(nextThreadId);
    store.set(
      agentChatInputState.atom,
      tipTapDocumentToMarkdown(draftsByThreadId[nextThreadId] ?? ''),
    );
  }, [store, projectAiChatThreadToUrl]);

  return { leaveRemovedAiChatThread };
};
