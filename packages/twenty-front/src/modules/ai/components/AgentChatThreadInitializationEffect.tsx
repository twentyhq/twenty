import { useAtomValue, useStore } from 'jotai';
import { useEffect } from 'react';
import {
  isDefined,
  isValidUuid,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';

import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const AgentChatThreadInitializationEffect = () => {
  const { refreshAgentChatThreads } = useRefreshAgentChatThreads();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatThreadsLoading = useSetAtomState(
    agentChatThreadsLoadingState,
  );
  const threadTitleFamilyCallback = useAtomComponentFamilyStateCallbackState(
    currentAiChatThreadTitleComponentFamilyState,
  );
  const agentChatUsageFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatUsageComponentFamilyState,
  );
  const store = useStore();
  const agentChatVisibleThreads = useAtomStateValue(
    agentChatVisibleThreadsSelector,
  );
  const storeEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );
  const [hasInitializedAgentChatThreads, setHasInitializedAgentChatThreads] =
    useAtomState(hasInitializedAgentChatThreadsState);

  useEffect(() => {
    if (storeEntry.status !== 'empty' || !hasAiPermission) {
      return;
    }

    void refreshAgentChatThreads();
  }, [storeEntry.status, hasAiPermission, refreshAgentChatThreads]);

  useEffect(() => {
    setAgentChatThreadsLoading(
      storeEntry.status === 'empty' && hasAiPermission,
    );
  }, [storeEntry.status, hasAiPermission, setAgentChatThreadsLoading]);

  useEffect(() => {
    if (
      hasInitializedAgentChatThreads ||
      (currentAiChatThread !== null && isValidUuid(currentAiChatThread))
    ) {
      return;
    }

    if (storeEntry.status === 'empty' && hasAiPermission) {
      return;
    }

    setHasInitializedAgentChatThreads(true);

    const sortedThreads = sortChatThreadsByLastActivityDesc(
      agentChatVisibleThreads,
    );

    if (sortedThreads.length > 0) {
      const firstThread = sortedThreads[0];
      const draftForThread =
        store.get(agentChatDraftsByThreadIdState.atom)[firstThread.id] ?? '';

      setCurrentAiChatThread(firstThread.id);
      setAgentChatInput(tipTapDocumentToMarkdown(draftForThread));

      const firstThreadFamilyKey = { threadId: firstThread.id };

      store.set(
        threadTitleFamilyCallback(firstThreadFamilyKey),
        firstThread.title ?? null,
      );

      const hasUsageData =
        (firstThread.conversationSize ?? 0) > 0 &&
        isDefined(firstThread.contextWindowTokens);

      store.set(
        agentChatUsageFamilyCallback(firstThreadFamilyKey),
        hasUsageData
          ? {
              lastMessage: null,
              conversationSize: firstThread.conversationSize ?? 0,
              contextWindowTokens: firstThread.contextWindowTokens ?? 0,
              inputTokens: firstThread.totalInputTokens,
              outputTokens: firstThread.totalOutputTokens,
              inputCredits: firstThread.totalInputCredits,
              outputCredits: firstThread.totalOutputCredits,
            }
          : null,
      );
    } else {
      store.set(hasTriggeredCreateForDraftState.atom, false);
      setCurrentAiChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
      setAgentChatInput(
        tipTapDocumentToMarkdown(
          store.get(agentChatDraftsByThreadIdState.atom)[
            AGENT_CHAT_NEW_THREAD_DRAFT_KEY
          ] ?? '',
        ),
      );
    }
  }, [
    agentChatVisibleThreads,
    currentAiChatThread,
    hasAiPermission,
    hasInitializedAgentChatThreads,
    setHasInitializedAgentChatThreads,
    storeEntry.status,
    setCurrentAiChatThread,
    setAgentChatInput,
    store,
    threadTitleFamilyCallback,
    agentChatUsageFamilyCallback,
  ]);

  return null;
};
