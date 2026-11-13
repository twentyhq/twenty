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
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/ai/constants/AgentChatRecentThreadListSource';
import { useLoadInboxThreadList } from '@/ai/hooks/useLoadAgentChatThreadList';
import { agentChatUsageFamilyState } from '@/ai/states/agentChatUsageFamilyState';
import { inboxRecentThreadsLoadingSelector } from '@/ai/states/selectors/agentChatRecentThreadsLoadingSelector';
import { inboxThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { inboxFavoriteThreadsSelector } from '@/ai/states/selectors/agentChatFavoriteThreadsSelector';
import { inboxSelectedThreadListSourceState } from '@/ai/states/agentChatSelectedThreadListSourceState';
import { inboxThreadListThreadsFamilySelector } from '@/ai/states/selectors/agentChatThreadListThreadsFamilySelector';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasInitializedInboxThreadsState } from '@/ai/states/hasInitializedAgentChatThreadsState';
import { newInboxThreadIdState } from '@/ai/states/newAiChatThreadIdState';
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

const INBOX_THREADS_REFRESH_RETRY_DELAY_MS = 3000;

export const InboxThreadInitializationEffect = () => {
  const { loadInboxThreadList } = useLoadInboxThreadList();
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

  const inboxRecentThreadsLoading = useAtomStateValue(
    inboxRecentThreadsLoadingSelector,
  );

  const currentInboxThread = useAtomStateValue(currentInboxThreadState);
  const setCurrentInboxThread = useSetAtomState(currentInboxThreadState);
  const store = useStore();
  const favoriteThreadIdsKey = useAtomStateValue(inboxFavoriteThreadsSelector)
    .map(({ id }) => id)
    .join(',');
  const inboxSelectedThreadListSource = useAtomStateValue(
    inboxSelectedThreadListSourceState,
  );
  const inboxThreadListThreads = useAtomFamilySelectorValue(
    inboxThreadListThreadsFamilySelector,
    inboxSelectedThreadListSource,
  );
  const [hasInitializedInboxThreads, setHasInitializedInboxThreads] =
    useAtomState(hasInitializedInboxThreadsState);

  useEffect(() => {
    if (!areFieldMetadataItemsLoaded || !canLoadChatThreads) {
      return;
    }

    const hasUnloadedFavoriteThreads = store
      .get(inboxFavoriteThreadsSelector.atom)
      .some(({ conversationType }) => !isDefined(conversationType));

    if (!inboxRecentThreadsLoading && !hasUnloadedFavoriteThreads) {
      return;
    }

    let isActive = true;
    let retryTimeoutId: number | undefined;

    const refreshUntilLoaded = async () => {
      const agentChatThreads = await loadInboxThreadList({
        source: INBOX_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      });

      if (!isActive || isDefined(agentChatThreads)) {
        return;
      }

      retryTimeoutId = window.setTimeout(
        () => void refreshUntilLoaded(),
        INBOX_THREADS_REFRESH_RETRY_DELAY_MS,
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
    inboxRecentThreadsLoading,
    areFieldMetadataItemsLoaded,
    canLoadChatThreads,
    favoriteThreadIdsKey,
    loadInboxThreadList,
    store,
  ]);

  useEffect(() => {
    if (hasInitializedInboxThreads || inboxRecentThreadsLoading) {
      return;
    }

    if (isDefined(currentInboxThread)) {
      const selectedThread = store.get(
        inboxThreadRecordFamilySelector.selectorFamily(currentInboxThread),
      );

      if (isDefined(selectedThread)) {
        store.set(
          agentChatUsageFamilyState.atomFamily({ threadId: selectedThread.id }),
          getAgentChatUsageFromThread(selectedThread),
        );
      }
      setHasInitializedInboxThreads(true);
      return;
    }

    setHasInitializedInboxThreads(true);

    const sortedThreads = sortChatThreadsByLastActivityDesc(
      inboxThreadListThreads,
    );

    if (sortedThreads.length > 0) {
      const firstThread = sortedThreads[0];

      setCurrentInboxThread(firstThread.id);
      store.set(
        agentChatUsageFamilyState.atomFamily({ threadId: firstThread.id }),
        getAgentChatUsageFromThread(firstThread),
      );
    } else {
      setCurrentInboxThread(store.get(newInboxThreadIdState.atom));
    }
  }, [
    inboxThreadListThreads,
    currentInboxThread,
    inboxRecentThreadsLoading,
    hasInitializedInboxThreads,
    setHasInitializedInboxThreads,
    setCurrentInboxThread,
    store,
  ]);

  return null;
};
