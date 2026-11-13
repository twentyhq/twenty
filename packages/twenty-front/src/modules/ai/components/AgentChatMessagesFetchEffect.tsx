import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  type AgentChatSubscriptionEvent,
  mapAgentMessagesToUIMessages,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { INBOX_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { useIsOnNewInboxSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { inboxLiveReactionRevisionsFamilyState } from '@/ai/states/agentChatLiveReactionRevisionsFamilyState';
import { inboxMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { inboxFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { agentChatFirstLiveSeqFamilyState } from '@/ai/states/agentChatFirstLiveSeqFamilyState';
import { agentChatHandleEventCallbackFamilyState } from '@/ai/states/agentChatHandleEventCallbackFamilyState';
import { agentChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { inboxMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatQueuedMessagesFamilyState } from '@/ai/states/agentChatQueuedMessagesFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentAiChatThreadState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  GetChatMessagesDocument,
  type GetChatMessagesQuery,
} from '~/generated-metadata/graphql';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

export const InboxMessagesFetchEffect = () => {
  const store = useStore();
  const currentInboxThread = useAtomStateValue(currentInboxThreadState);

  const isNewThread = useIsOnNewInboxSlot() || currentInboxThread === null;

  const setInboxMessagesLoading = useSetAtomState(inboxMessagesLoadingState);

  const setSkipMessagesSkeletonUntilLoaded = useSetAtomState(
    skipMessagesSkeletonUntilLoadedState,
  );

  const setInboxFetchedMessages = useSetAtomFamilyState(
    inboxFetchedMessagesFamilyState,
    { threadId: currentInboxThread },
  );

  const setAgentChatQueuedMessages = useSetAtomFamilyState(
    agentChatQueuedMessagesFamilyState,
    { threadId: currentInboxThread },
  );

  const setAgentChatIsAwaitingPersistedRefetch = useSetAtomFamilyState(
    agentChatIsAwaitingPersistedRefetchFamilyState,
    { threadId: currentInboxThread },
  );

  const handleFirstLoad = useCallback(
    (_data: GetChatMessagesQuery) => {
      setSkipMessagesSkeletonUntilLoaded(false);
    },
    [setSkipMessagesSkeletonUntilLoaded],
  );

  const handleDataLoaded = useCallback(
    (data: GetChatMessagesQuery) => {
      const error = store.get(
        agentChatErrorFamilyState.atomFamily({ threadId: currentInboxThread }),
      );
      if (isGraphqlErrorOfType(error, 'NOT_FOUND')) {
        return;
      }
      const uiMessages = mapAgentMessagesToUIMessages(data.chatMessages ?? []);
      // A live snapshot is at least as recent as a fetch, which may have been read before it
      const liveReactionRevisions = store.get(
        inboxLiveReactionRevisionsFamilyState.atomFamily({
          threadId: currentInboxThread,
        }),
      );

      for (const message of data.chatMessages ?? []) {
        if (isDefined(liveReactionRevisions[message.id])) {
          continue;
        }

        store.set(
          inboxMessageReactionsFamilyState.atomFamily({
            messageId: message.id,
          }),
          message.reactions,
        );
      }
      setInboxFetchedMessages(
        uiMessages.filter((message) => message.status !== 'queued'),
      );
      setAgentChatQueuedMessages(
        uiMessages.filter((message) => message.status === 'queued'),
      );
      setAgentChatIsAwaitingPersistedRefetch(false);

      const catchup = data.chatStreamCatchupChunks;

      if (!isDefined(catchup)) {
        return;
      }

      const threadId = store.get(currentInboxThreadState.atom);

      if (!isDefined(threadId)) {
        return;
      }

      const familyKey = { threadId };

      const handleEvent = store.get(
        agentChatHandleEventCallbackFamilyState.atomFamily(familyKey),
      );

      if (!isDefined(handleEvent)) {
        return;
      }

      const firstLiveSeq = store.get(
        agentChatFirstLiveSeqFamilyState.atomFamily(familyKey),
      );

      for (let index = 0; index < catchup.chunks.length; index++) {
        handleEvent({
          type: 'stream-chunk',
          chunk: catchup.chunks[index],
          seq: index + 1,
        } as AgentChatSubscriptionEvent);
      }

      if (isDefined(catchup.error) && firstLiveSeq === null) {
        handleEvent({
          type: 'stream-error',
          code: catchup.error.code,
          message: catchup.error.message,
        } as AgentChatSubscriptionEvent);
      }
    },
    [
      currentInboxThread,
      setInboxFetchedMessages,
      setAgentChatQueuedMessages,
      setAgentChatIsAwaitingPersistedRefetch,
      store,
    ],
  );

  const handleLoadingChange = useCallback(
    (loading: boolean) => {
      setInboxMessagesLoading(loading);

      if (!loading) {
        setAgentChatIsAwaitingPersistedRefetch(false);
      }
    },
    [setInboxMessagesLoading, setAgentChatIsAwaitingPersistedRefetch],
  );

  const { refetch: refetchInboxMessages } = useQueryWithCallbacks(
    GetChatMessagesDocument,
    {
      variables: { threadId: currentInboxThread ?? '' },
      fetchPolicy: 'network-only',
      skip: isNewThread,
      onFirstLoad: handleFirstLoad,
      onDataLoaded: handleDataLoaded,
      onLoadingChange: handleLoadingChange,
    },
  );

  const handleRefetchMessages = useCallback(() => {
    if (isNewThread) {
      return;
    }

    refetchInboxMessages();
  }, [refetchInboxMessages, isNewThread]);

  useListenToBrowserEvent({
    eventName: INBOX_REFETCH_MESSAGES_EVENT_NAME,
    onBrowserEvent: handleRefetchMessages,
  });

  const handleSseClientReconnected = useCallback(() => {
    store.set(
      inboxLiveReactionRevisionsFamilyState.atomFamily({
        threadId: currentInboxThread,
      }),
      {},
    );
    handleRefetchMessages();
  }, [currentInboxThread, handleRefetchMessages, store]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: handleSseClientReconnected,
  });

  return null;
};
