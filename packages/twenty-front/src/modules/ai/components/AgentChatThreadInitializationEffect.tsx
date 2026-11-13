import { useStore } from 'jotai';
import { useEffect } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { getAgentChatUsageFromThread } from '@/ai/utils/getAgentChatUsageFromThread';
import { AGENT_CHAT_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useLoadAgentChatThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { agentChatRecentThreadsLoadingSelector } from '@/ai/states/selectors/agentChatRecentThreadsLoadingSelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { agentChatFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { agentChatSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { agentChatThreadListThreadsFamilySelector } from '@/ai/states/selectors/agentChatThreadListThreadsFamilySelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasInitializedAgentChatThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const AGENT_CHAT_THREADS_REFRESH_RETRY_DELAY_MS = 3000;

export const AgentChatThreadInitializationEffect = () => {
  const { loadAgentChatThreadList } = useLoadAgentChatThreadList();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: StandardObjectNameSingular.AgentChatThread,
      objectNameType: 'singular',
    },
  );
  const chatObjectPermissions = useObjectPermissionsForObject(
    chatObjectMetadataItem?.id ?? '',
  );
  const canLoadChatThreads =
    hasAiPermission &&
    !isWorkspaceSuspended &&
    isDefined(chatObjectMetadataItem) &&
    isNonEmptyArray(chatObjectMetadataItem.readableFields) &&
    canAccessThroughAllRecordsOrRlsPermission({
      objectRecordsPermissions: chatObjectPermissions,
      operationType: 'read',
    });
  // The record API builds chat queries from the chat object's fields.
  const areFieldMetadataItemsLoaded =
    useAtomFamilySelectorValue(
      metadataStoreStatusFamilySelector,
      'fieldMetadataItems',
    ) === 'up-to-date';

  const agentChatRecentThreadsLoading = useAtomStateValue(
    agentChatRecentThreadsLoadingSelector,
  );

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const store = useStore();
  const favoriteThreadIdsKey = useAtomStateValue(
    agentChatFavoriteThreadsSelector,
  )
    .map(({ id }) => id)
    .join(',');
  const agentChatSelectedThreadListSource = useAtomStateValue(
    agentChatSelectedThreadListSourceState,
  );
  const agentChatThreadListThreads = useAtomFamilySelectorValue(
    agentChatThreadListThreadsFamilySelector,
    agentChatSelectedThreadListSource,
  );
  const [hasInitializedAgentChatThreads, setHasInitializedAgentChatThreads] =
    useAtomState(hasInitializedAgentChatThreadsState);

  useEffect(() => {
    if (!areFieldMetadataItemsLoaded || !canLoadChatThreads) {
      return;
    }

    const hasUnloadedFavoriteThreads = store
      .get(agentChatFavoriteThreadsSelector.atom)
      .some(({ conversationType }) => !isDefined(conversationType));

    if (!agentChatRecentThreadsLoading && !hasUnloadedFavoriteThreads) {
      return;
    }

    let isActive = true;
    let retryTimeoutId: number | undefined;

    const refreshUntilLoaded = async () => {
      const agentChatThreads = await loadAgentChatThreadList({
        source: AGENT_CHAT_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      });

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
    agentChatRecentThreadsLoading,
    areFieldMetadataItemsLoaded,
    canLoadChatThreads,
    favoriteThreadIdsKey,
    loadAgentChatThreadList,
    store,
  ]);

  useEffect(() => {
    if (hasInitializedAgentChatThreads || agentChatRecentThreadsLoading) {
      return;
    }

    if (isDefined(currentAiChatThread)) {
      const selectedThread = store.get(
        agentChatThreadRecordFamilySelector.selectorFamily(currentAiChatThread),
      );

      if (isDefined(selectedThread)) {
        store.set(
          agentChatUsageFamilyState.atomFamily({ threadId: selectedThread.id }),
          getAgentChatUsageFromThread(selectedThread),
        );
      }
      setHasInitializedAgentChatThreads(true);
      return;
    }

    setHasInitializedAgentChatThreads(true);

    const sortedThreads = sortChatThreadsByLastActivityDesc(
      agentChatThreadListThreads,
    );

    if (sortedThreads.length > 0) {
      const firstThread = sortedThreads[0];

      setCurrentAiChatThread(firstThread.id);
      store.set(
        agentChatUsageFamilyState.atomFamily({ threadId: firstThread.id }),
        getAgentChatUsageFromThread(firstThread),
      );
    } else {
      setCurrentAiChatThread(store.get(newAiChatThreadIdState.atom));
    }
  }, [
    agentChatThreadListThreads,
    currentAiChatThread,
    agentChatRecentThreadsLoading,
    hasInitializedAgentChatThreads,
    setHasInitializedAgentChatThreads,
    setCurrentAiChatThread,
    store,
  ]);

  return null;
};
