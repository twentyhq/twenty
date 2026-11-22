import { useStore } from 'jotai';
import { useEffect } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatPageThreadId } from '@/ai-chat/hooks/useAiChatPageThreadId';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { useAddInboxThread } from '@/inbox/hooks/useAddInboxThread';
import { useHandleInboxThreadRecordOperation } from '@/inbox/hooks/useHandleInboxThreadRecordOperation';
import { useInboxThreadSyncStatus } from '@/inbox/hooks/useInboxThreadSyncStatus';
import { useRefreshShownInboxThreadList } from '@/inbox/hooks/useRefreshShownInboxThreadList';
import { useReloadInboxThreads } from '@/inbox/hooks/useReloadInboxThreads';
import { inboxFavoriteThreadsSelector } from '@/inbox/states/selectors/inboxFavoriteThreadsSelector';
import { inboxRecentThreadsLoadingSelector } from '@/inbox/states/selectors/inboxRecentThreadsLoadingSelector';
import { metadataStoreStatusFamilySelector } from '@/metadata-store/states/metadataStoreStatusFamilySelector';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const INBOX_THREADS_LOAD_RETRY_DELAY_MS = 3000;

const AI_CHAT_THREADS_OPERATION_SIGNATURE = {
  objectNameSingular: StandardObjectNameSingular.AgentChatThread,
  variables: {},
};

export const InboxThreadSyncEffect = () => {
  const store = useStore();
  const { chatObjectMetadataItemId, isThreadSyncEnabled, canLoadChatThreads } =
    useInboxThreadSyncStatus();
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

  const { refreshShownInboxThreadList } = useRefreshShownInboxThreadList();
  const { prependInboxThreadToRecentList } = useAddInboxThread();
  const { refreshRecentThreads, reloadThreads } = useReloadInboxThreads();
  const { handleInboxThreadRecordOperation } =
    useHandleInboxThreadRecordOperation();

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

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: handleInboxThreadRecordOperation,
    objectMetadataItemId: chatObjectMetadataItemId,
    enabled: isThreadSyncEnabled,
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
