import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import {
  type AgentChatSubscriptionEvent,
  mapAgentMessagesToUIMessages,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { useIsOnNewAiChatSlot } from '@/ai/hooks/useIsOnNewAiChatSlot';
import { aiChatLiveReactionRevisionsFamilyState } from '@/ai/states/agentChatLiveReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai/states/agentChatMessageReactionsFamilyState';
import { aiChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { aiChatFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { aiChatFirstLiveSeqFamilyState } from '@/ai/states/agentChatFirstLiveSeqFamilyState';
import { aiChatHandleEventCallbackFamilyState } from '@/ai/states/agentChatHandleEventCallbackFamilyState';
import { aiChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { aiChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { aiChatQueuedMessagesFamilyState } from '@/ai/states/agentChatQueuedMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
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

export const AiChatMessagesFetchEffect = () => {
  const store = useStore();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const isNewThread = useIsOnNewAiChatSlot() || currentAiChatThread === null;

  const setAiChatMessagesLoading = useSetAtomState(aiChatMessagesLoadingState);

  const setSkipMessagesSkeletonUntilLoaded = useSetAtomState(
    skipMessagesSkeletonUntilLoadedState,
  );

  const setAiChatFetchedMessages = useSetAtomFamilyState(
    aiChatFetchedMessagesFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAiChatQueuedMessages = useSetAtomFamilyState(
    aiChatQueuedMessagesFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAiChatIsAwaitingPersistedRefetch = useSetAtomFamilyState(
    aiChatIsAwaitingPersistedRefetchFamilyState,
    { threadId: currentAiChatThread },
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
        aiChatErrorFamilyState.atomFamily({ threadId: currentAiChatThread }),
      );
      if (isGraphqlErrorOfType(error, 'NOT_FOUND')) {
        return;
      }
      const uiMessages = mapAgentMessagesToUIMessages(data.chatMessages ?? []);
      // A live snapshot is at least as recent as a fetch, which may have been read before it
      const liveReactionRevisions = store.get(
        aiChatLiveReactionRevisionsFamilyState.atomFamily({
          threadId: currentAiChatThread,
        }),
      );

      for (const message of data.chatMessages ?? []) {
        if (isDefined(liveReactionRevisions[message.id])) {
          continue;
        }

        store.set(
          aiChatMessageReactionsFamilyState.atomFamily({
            messageId: message.id,
          }),
          message.reactions,
        );
      }
      setAiChatFetchedMessages(
        uiMessages.filter((message) => message.status !== 'queued'),
      );
      setAiChatQueuedMessages(
        uiMessages.filter((message) => message.status === 'queued'),
      );
      setAiChatIsAwaitingPersistedRefetch(false);

      const catchup = data.chatStreamCatchupChunks;

      if (!isDefined(catchup)) {
        return;
      }

      const threadId = store.get(currentAiChatThreadState.atom);

      if (!isDefined(threadId)) {
        return;
      }

      const familyKey = { threadId };

      const handleEvent = store.get(
        aiChatHandleEventCallbackFamilyState.atomFamily(familyKey),
      );

      if (!isDefined(handleEvent)) {
        return;
      }

      const firstLiveSeq = store.get(
        aiChatFirstLiveSeqFamilyState.atomFamily(familyKey),
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
      currentAiChatThread,
      setAiChatFetchedMessages,
      setAiChatQueuedMessages,
      setAiChatIsAwaitingPersistedRefetch,
      store,
    ],
  );

  const handleLoadingChange = useCallback(
    (loading: boolean) => {
      setAiChatMessagesLoading(loading);

      if (!loading) {
        setAiChatIsAwaitingPersistedRefetch(false);
      }
    },
    [setAiChatMessagesLoading, setAiChatIsAwaitingPersistedRefetch],
  );

  const { refetch: refetchAiChatMessages } = useQueryWithCallbacks(
    GetChatMessagesDocument,
    {
      variables: { threadId: currentAiChatThread ?? '' },
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

    refetchAiChatMessages();
  }, [refetchAiChatMessages, isNewThread]);

  useListenToBrowserEvent({
    eventName: AI_CHAT_REFETCH_MESSAGES_EVENT_NAME,
    onBrowserEvent: handleRefetchMessages,
  });

  const handleSseClientReconnected = useCallback(() => {
    store.set(
      aiChatLiveReactionRevisionsFamilyState.atomFamily({
        threadId: currentAiChatThread,
      }),
      {},
    );
    handleRefetchMessages();
  }, [currentAiChatThread, handleRefetchMessages, store]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: handleSseClientReconnected,
  });

  return null;
};
