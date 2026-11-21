import { isString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import {
  canAccessThroughAllRecordsOrRlsPermission,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { useDebouncedCallback } from 'use-debounce';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { useApplyAiChatThreadUpdate } from '@/ai-chat/threads/hooks/useApplyAiChatThreadUpdate';
import { aiChatThreadParticipantsState } from '@/ai-chat/threads/states/aiChatThreadParticipantsState';
import { aiChatThreadRecordUpdateCountState } from '@/ai-chat/threads/states/aiChatThreadRecordUpdateCountState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { INBOX_RECENT_THREAD_LIST_SOURCE } from '@/inbox/constants/InboxRecentThreadListSource';
import { useAddInboxThread } from '@/inbox/hooks/useAddInboxThread';
import { useLeaveRemovedInboxThread } from '@/inbox/hooks/useLeaveRemovedInboxThread';
import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { useRefreshInboxChannelSummaries } from '@/inbox/hooks/useRefreshInboxChannelSummaries';
import { useRefreshInboxChannels } from '@/inbox/hooks/useRefreshInboxChannels';
import { useRefreshShownInboxThreadList } from '@/inbox/hooks/useRefreshShownInboxThreadList';
import { useRefreshInboxOpenThreadsSummary } from '@/inbox/hooks/useRefreshInboxOpenThreadsSummary';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { inboxRecentThreadsLoadingSelector } from '@/inbox/states/selectors/inboxRecentThreadsLoadingSelector';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const INBOX_THREADS_LOAD_RETRY_DELAY_MS = 3000;
// Changes come in bursts, as a message updates a chat and its members' rows
const INBOX_CHANNELS_REFRESH_DEBOUNCE_MS = 1000;

const AI_CHAT_THREADS_OPERATION_SIGNATURE = {
  objectNameSingular: StandardObjectNameSingular.AgentChatThread,
  variables: {},
};

const toThreadUpdate = ({
  recordId,
  updatedFields,
  updatedRecord,
}: ObjectRecordOperationUpdateInput): Partial<AiChatThreadRecord> & {
  id: string;
} => {
  const updatedAt = updatedRecord?.updatedAt;

  return {
    id: recordId,
    ...(isString(updatedAt) ? { updatedAt } : {}),
    ...(Object.assign({}, ...updatedFields) as Partial<AiChatThreadRecord>),
  };
};

export const InboxSyncEffect = () => {
  const store = useStore();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
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
  // The record API builds chat queries from the chat object's fields
  const areFieldMetadataItemsLoaded =
    useAtomFamilySelectorValue(
      metadataStoreStatusFamilySelector,
      'fieldMetadataItems',
    ) === 'up-to-date';
  const inboxRecentThreadsLoading = useAtomStateValue(
    inboxRecentThreadsLoadingSelector,
  );
  const favoriteThreadIdsKey = useAtomStateValue(inboxFavoriteThreadsSelector)
    .map(({ id }) => id)
    .join(',');
  const aiChatPageThreadId = useAiChatPageThreadId();
  const aiChatPageThreadRecord = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    aiChatPageThreadId ?? '',
  );
  const aiChatThreadReplyError = useAtomFamilyStateValue(
    aiChatThreadReplyErrorFamilyState,
    { threadId: aiChatPageThreadId ?? null },
  );
  const aiChatThreadRecordUpdateCount = useAtomStateValue(
    aiChatThreadRecordUpdateCountState,
  );
  const aiChatThreadParticipants = useAtomStateValue(
    aiChatThreadParticipantsState,
  );

  const { loadInboxThreadList } = useLoadInboxThreadList();
  const { refreshShownInboxThreadList } = useRefreshShownInboxThreadList();
  const { addInboxThread, prependInboxThreadToRecentList } =
    useAddInboxThread();
  const { applyAiChatThreadUpdate } = useApplyAiChatThreadUpdate();
  const { leaveRemovedInboxThread } = useLeaveRemovedInboxThread();
  const { refreshInboxOpenThreadsSummary } =
    useRefreshInboxOpenThreadsSummary();
  const { refreshInboxChannels } = useRefreshInboxChannels();
  const { refreshInboxChannelSummaries } = useRefreshInboxChannelSummaries();

  const isThreadSyncEnabled = isDefined(chatObjectMetadataItem);
  const canLoadChatThreads =
    hasAiPermission &&
    !isWorkspaceSuspended &&
    isThreadSyncEnabled &&
    isNonEmptyArray(chatObjectMetadataItem.readableFields) &&
    canAccessThroughAllRecordsOrRlsPermission({
      objectRecordsPermissions: chatObjectPermissions,
      operationType: 'read',
    });
  const isChannelSyncEnabled =
    isAiChatInboxEnabled && hasAiPermission && !isWorkspaceSuspended;

  const refreshRecentThreads = useCallback(
    () =>
      loadInboxThreadList({
        source: INBOX_RECENT_THREAD_LIST_SOURCE,
        mode: 'refresh',
      }),
    [loadInboxThreadList],
  );

  // The removal check looks the chat up itself, so it runs even if the reload fails
  const reloadThreads = useCallback(async () => {
    refreshInboxOpenThreadsSummary();
    await refreshRecentThreads();
    await leaveRemovedInboxThread();
  }, [
    leaveRemovedInboxThread,
    refreshInboxOpenThreadsSummary,
    refreshRecentThreads,
  ]);

  const debouncedRefreshChannels = useDebouncedCallback(
    () => void refreshInboxChannels(),
    INBOX_CHANNELS_REFRESH_DEBOUNCE_MS,
  );
  const debouncedRefreshSummaries = useDebouncedCallback(() => {
    refreshInboxOpenThreadsSummary();
    void refreshInboxChannelSummaries();
  }, INBOX_CHANNELS_REFRESH_DEBOUNCE_MS);

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
      const agentChatThreads = await refreshRecentThreads();

      if (!isActive) {
        return;
      }

      if (isDefined(agentChatThreads)) {
        refreshShownInboxThreadList();
        return;
      }

      retryTimeoutId = window.setTimeout(
        () => void refreshUntilLoaded(),
        INBOX_THREADS_LOAD_RETRY_DELAY_MS,
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
    refreshRecentThreads,
    refreshShownInboxThreadList,
    store,
  ]);

  useListenToEventsForQuery({
    queryId: 'agent-chat-thread-record-operations',
    operationSignature: AI_CHAT_THREADS_OPERATION_SIGNATURE,
    skip: !isThreadSyncEnabled,
    onSseReconnected: reloadThreads,
  });

  const handleThreadOperation = useCallback(
    ({ operation }: ObjectRecordOperationBrowserEventDetail) => {
      const applyUpdates = (
        updates: (Partial<AiChatThreadRecord> & { id: string })[],
      ) => {
        for (const update of updates) {
          applyAiChatThreadUpdate(update);
        }
      };

      switch (operation.type) {
        case 'create-one': {
          addInboxThread(operation.createdRecord as AiChatThreadRecord);
          return;
        }
        case 'update-one':
        case 'update-many': {
          const updateInputs =
            operation.type === 'update-one'
              ? [operation.result.updateInput]
              : operation.result.updateInputs;

          applyUpdates(updateInputs.map(toThreadUpdate));

          // An updated chat past the loaded pages moves to the top
          const listedThreadIds =
            store.get(
              inboxThreadListFamilyState.atomFamily(
                getInboxThreadListSourceKey(INBOX_RECENT_THREAD_LIST_SOURCE),
              ),
            )?.threadIds ?? [];

          if (
            updateInputs.some(
              ({ recordId }) => !listedThreadIds.includes(recordId),
            )
          ) {
            void refreshRecentThreads();
          }
          return;
        }
        case 'delete-one':
        case 'delete-many': {
          const deletedAt = new Date().toISOString();
          const deletedRecordIds =
            operation.type === 'delete-one'
              ? [operation.deletedRecordId]
              : operation.deletedRecordIds;

          applyUpdates(deletedRecordIds.map((id) => ({ id, deletedAt })));
          return;
        }
        case 'restore-one':
        case 'restore-many': {
          const restoredRecords =
            operation.type === 'restore-one'
              ? [operation.restoredRecord]
              : operation.restoredRecords;

          applyUpdates(
            restoredRecords.map(({ id }) => ({ id, deletedAt: null })),
          );
          return;
        }
        default:
          // Destroy and bulk create events carry no ids
          void reloadThreads();
      }
    },
    [
      addInboxThread,
      applyAiChatThreadUpdate,
      refreshRecentThreads,
      reloadThreads,
      store,
    ],
  );

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleThreadOperation,
    objectMetadataItemId: chatObjectMetadataItem?.id,
    enabled: isThreadSyncEnabled,
  });

  useEffect(() => {
    if (isChannelSyncEnabled) {
      void refreshInboxChannels();
    }
  }, [isChannelSyncEnabled, refreshInboxChannels]);

  const handleChannelOperation = useCallback(() => {
    if (isChannelSyncEnabled) {
      debouncedRefreshChannels();
    }
  }, [debouncedRefreshChannels, isChannelSyncEnabled]);

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'agentChatChannel',
    onMetadataOperationBrowserEvent: handleChannelOperation,
    skip: !isChannelSyncEnabled,
  });

  useListenToMetadataOperationBrowserEvent({
    metadataName: 'agentChatChannelRole',
    onMetadataOperationBrowserEvent: handleChannelOperation,
    skip: !isChannelSyncEnabled,
  });

  useEffect(() => {
    if (isChannelSyncEnabled) {
      debouncedRefreshSummaries();
    }
  }, [
    aiChatThreadParticipants,
    aiChatThreadRecordUpdateCount,
    debouncedRefreshSummaries,
    isChannelSyncEnabled,
  ]);

  // Changes broadcast while disconnected are not replayed
  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: handleChannelOperation,
  });

  const isPageThreadFetched = isDefined(
    aiChatPageThreadRecord?.conversationType,
  );
  const isPageThreadNotFound = isGraphqlErrorOfType(
    aiChatThreadReplyError,
    'NOT_FOUND',
  );

  useEffect(() => {
    if (isDefined(aiChatPageThreadId) && isPageThreadFetched) {
      prependInboxThreadToRecentList(aiChatPageThreadId);
    }
  }, [aiChatPageThreadId, isPageThreadFetched, prependInboxThreadToRecentList]);

  useEffect(() => {
    if (isPageThreadNotFound) {
      void refreshRecentThreads();
    }
  }, [isPageThreadNotFound, refreshRecentThreads]);

  return null;
};
