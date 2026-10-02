import { useStore } from 'jotai';
import { useEffect } from 'react';
import {
  isDefined,
  isValidUuid,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';

import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatThreadListState } from '@/ai/states/agentChatThreadListState';
import { agentChatThreadsLoadingState } from '@/ai/states/agentChatThreadsLoadingState';
import { agentChatUsageComponentFamilyState } from '@/ai/states/agentChatUsageComponentFamilyState';
import { agentChatThreadsSelector } from '@/ai/states/selectors/agentChatThreadsSelector';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { currentAiChatThreadTitleComponentFamilyState } from '@/ai/states/currentAiChatThreadTitleComponentFamilyState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const AGENT_CHAT_THREADS_REFRESH_RETRY_DELAY_MS = 3000;

export const AgentChatThreadInitializationEffect = () => {
  const { refreshAgentChatThreads } = useRefreshAgentChatThreads();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  // The record API builds chat queries from the chat object's fields.
  const areFieldMetadataItemsLoaded =
    useAtomFamilySelectorValue(
      metadataStoreStatusFamilySelector,
      'fieldMetadataItems',
    ) === 'up-to-date';

  // The record API refuses a suspended workspace
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const canLoadAgentChatThreads = hasAiPermission && !isWorkspaceSuspended;

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
  const agentChatThreadList = useAtomStateValue(agentChatThreadListState);
  const agentChatThreads = useAtomStateValue(agentChatThreadsSelector);
  const areAgentChatThreadsLoaded = agentChatThreadList !== null;
  const [hasInitializedAgentChatThreads, setHasInitializedAgentChatThreads] =
    useAtomState(hasInitializedAgentChatThreadsState);

  useEffect(() => {
    if (
      areAgentChatThreadsLoaded ||
      !canLoadAgentChatThreads ||
      !areFieldMetadataItemsLoaded
    ) {
      return;
    }

    let isActive = true;
    let retryTimeoutId: number | undefined;

    const refreshUntilLoaded = async () => {
      const agentChatThreads = await refreshAgentChatThreads();

      if (!isActive || isDefined(agentChatThreads)) {
        return;
      }

      retryTimeoutId = window.setTimeout(
        () => void refreshUntilLoaded(),
        AGENT_CHAT_THREADS_REFRESH_RETRY_DELAY_MS,
      );
    };

    void refreshUntilLoaded();

    return () => {
      isActive = false;

      if (isDefined(retryTimeoutId)) {
        window.clearTimeout(retryTimeoutId);
      }
    };
  }, [
    areAgentChatThreadsLoaded,
    areFieldMetadataItemsLoaded,
    canLoadAgentChatThreads,
    refreshAgentChatThreads,
  ]);

  useEffect(() => {
    setAgentChatThreadsLoading(
      !areAgentChatThreadsLoaded && canLoadAgentChatThreads,
    );
  }, [
    areAgentChatThreadsLoaded,
    canLoadAgentChatThreads,
    setAgentChatThreadsLoading,
  ]);

  useEffect(() => {
    if (
      hasInitializedAgentChatThreads ||
      (!areAgentChatThreadsLoaded && canLoadAgentChatThreads)
    ) {
      return;
    }

    if (isDefined(currentAiChatThread) && isValidUuid(currentAiChatThread)) {
      const selectedThread = agentChatThreads.find(
        ({ id }) => id === currentAiChatThread,
      );
      if (isDefined(selectedThread)) {
        store.set(
          agentChatUsageFamilyCallback({ threadId: selectedThread.id }),
          getAgentChatUsageFromThread(selectedThread),
        );
      }
      setHasInitializedAgentChatThreads(true);
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

      store.set(
        agentChatUsageFamilyCallback(firstThreadFamilyKey),
        getAgentChatUsageFromThread(firstThread),
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
    canLoadAgentChatThreads,
    hasInitializedAgentChatThreads,
    setHasInitializedAgentChatThreads,
    areAgentChatThreadsLoaded,
    agentChatThreads,
    setCurrentAiChatThread,
    setAgentChatInput,
    store,
    threadTitleFamilyCallback,
    agentChatUsageFamilyCallback,
  ]);

  return null;
};
