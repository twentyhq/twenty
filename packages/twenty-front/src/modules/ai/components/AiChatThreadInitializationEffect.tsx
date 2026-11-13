import { useStore } from 'jotai';
import { useEffect } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { getAiChatUsageFromThread } from '@/ai/utils/getAiChatUsageFromThread';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { aiChatUsageFamilyState } from '@/ai/states/aiChatUsageFamilyState';
import { inboxRecentThreadsLoadingSelector } from '@/inbox/states/selectors/inboxRecentThreadsLoadingSelector';
import { aiChatThreadRecordFamilySelector } from '@/ai/states/selectors/aiChatThreadRecordFamilySelector';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { inboxSelectedThreadListSourceState } from '@/inbox/states/inboxSelectedThreadListSourceState';
import { inboxThreadListThreadsFamilySelector } from '@/inbox/states/selectors/inboxThreadListThreadsFamilySelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { hasInitializedAiChatThreadsState } from '@/ai/states/hasInitializedAiChatThreadsState';
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

const AI_CHAT_THREADS_REFRESH_RETRY_DELAY_MS = 3000;

export const AiChatThreadInitializationEffect = () => {
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

  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
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
  const [hasInitializedAiChatThreads, setHasInitializedAiChatThreads] =
    useAtomState(hasInitializedAiChatThreadsState);

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
        AI_CHAT_THREADS_REFRESH_RETRY_DELAY_MS,
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
    if (hasInitializedAiChatThreads || inboxRecentThreadsLoading) {
      return;
    }

    if (isDefined(currentAiChatThread)) {
      const selectedThread = store.get(
        aiChatThreadRecordFamilySelector.selectorFamily(currentAiChatThread),
      );

      if (isDefined(selectedThread)) {
        store.set(
          aiChatUsageFamilyState.atomFamily({ threadId: selectedThread.id }),
          getAiChatUsageFromThread(selectedThread),
        );
      }
      setHasInitializedAiChatThreads(true);
      return;
    }

    setHasInitializedAiChatThreads(true);

    const sortedThreads = sortChatThreadsByLastActivityDesc(
      inboxThreadListThreads,
    );

    if (sortedThreads.length > 0) {
      const firstThread = sortedThreads[0];

      setCurrentAiChatThread(firstThread.id);
      store.set(
        aiChatUsageFamilyState.atomFamily({ threadId: firstThread.id }),
        getAiChatUsageFromThread(firstThread),
      );
    } else {
      setCurrentAiChatThread(store.get(newAiChatThreadIdState.atom));
    }
  }, [
    inboxThreadListThreads,
    currentAiChatThread,
    inboxRecentThreadsLoading,
    hasInitializedAiChatThreads,
    setHasInitializedAiChatThreads,
    setCurrentAiChatThread,
    store,
  ]);

  return null;
};
