import { useStore } from 'jotai';
import { useEffect } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { inboxRecentThreadsLoadingSelector } from '@/inbox/states/selectors/inboxRecentThreadsLoadingSelector';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const AI_CHAT_THREADS_REFRESH_RETRY_DELAY_MS = 3000;

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

  const store = useStore();
  const favoriteThreadIdsKey = useAtomStateValue(inboxFavoriteThreadsSelector)
    .map(({ id }) => id)
    .join(',');

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

  return null;
};
