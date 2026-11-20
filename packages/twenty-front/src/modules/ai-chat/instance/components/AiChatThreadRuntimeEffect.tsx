import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { mapAgentMessagesToUIMessages } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { aiChatQueuedMessagesFamilyState } from '@/ai-chat/composer/states/aiChatQueuedMessagesFamilyState';
import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai-chat/constants/AiChatRefetchMessagesEventName';
import { useAiChatSubscription } from '@/ai-chat/instance/hooks/useAiChatSubscription';
import { aiChatLiveReactionRevisionsFamilyState } from '@/ai-chat/messages/states/aiChatLiveReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/messages/states/aiChatMessageReactionsFamilyState';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatFetchedMessagesFamilyState } from '@/ai-chat/states/aiChatFetchedMessagesFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai-chat/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsAwaitingPersistedRefetchFamilyState } from '@/ai-chat/states/aiChatIsAwaitingPersistedRefetchFamilyState';
import { aiChatIsStreamingFamilyState } from '@/ai-chat/states/aiChatIsStreamingFamilyState';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { aiChatMessagesLoadingFamilyState } from '@/ai-chat/states/aiChatMessagesLoadingFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadEventDetail } from '@/ai-chat/types/AiChatThreadEventDetail';
import { aiChatUsageFamilyState } from '@/ai-chat/usage/states/aiChatUsageFamilyState';
import { getAiChatUsageFromThread } from '@/ai-chat/usage/utils/getAiChatUsageFromThread';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  GetChatMessagesDocument,
  type GetChatMessagesQuery,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type AiChatThreadRuntimeEffectProps = {
  threadId: string;
};

export const AiChatThreadRuntimeEffect = ({
  threadId,
}: AiChatThreadRuntimeEffectProps) => {
  const store = useStore();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  const isNewThread = threadId === newAiChatThreadId;

  const { applyStreamCatchup } = useAiChatSubscription(
    isNewThread ? null : threadId,
  );

  const setAiChatMessagesLoading = useSetAtomFamilyState(
    aiChatMessagesLoadingFamilyState,
    { threadId },
  );

  const setAiChatFetchedMessages = useSetAtomFamilyState(
    aiChatFetchedMessagesFamilyState,
    { threadId },
  );

  const setAiChatQueuedMessages = useSetAtomFamilyState(
    aiChatQueuedMessagesFamilyState,
    { threadId },
  );

  const setAiChatIsAwaitingPersistedRefetch = useSetAtomFamilyState(
    aiChatIsAwaitingPersistedRefetchFamilyState,
    { threadId },
  );

  const handleDataLoaded = useCallback(
    (data: GetChatMessagesQuery) => {
      const error = store.get(aiChatErrorFamilyState.atomFamily({ threadId }));
      if (isGraphqlErrorOfType(error, 'NOT_FOUND')) {
        return;
      }
      const uiMessages = mapAgentMessagesToUIMessages(data.chatMessages ?? []);
      // A live snapshot is at least as recent as a fetch, which may have been read before it
      const liveReactionRevisions = store.get(
        aiChatLiveReactionRevisionsFamilyState.atomFamily({
          threadId,
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

      applyStreamCatchup(catchup);
    },
    [
      threadId,
      applyStreamCatchup,
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
      variables: { threadId },
      fetchPolicy: 'network-only',
      skip: isNewThread,
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

  const handleRefetchMessagesEvent = useCallback(
    (detail?: AiChatThreadEventDetail) => {
      if (detail?.threadId === threadId) {
        handleRefetchMessages();
      }
    },
    [threadId, handleRefetchMessages],
  );

  useListenToBrowserEvent<AiChatThreadEventDetail>({
    eventName: AI_CHAT_REFETCH_MESSAGES_EVENT_NAME,
    onBrowserEvent: handleRefetchMessagesEvent,
  });

  const handleSseClientReconnected = useCallback(() => {
    store.set(
      aiChatLiveReactionRevisionsFamilyState.atomFamily({
        threadId,
      }),
      {},
    );
    handleRefetchMessages();
  }, [threadId, handleRefetchMessages, store]);

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: handleSseClientReconnected,
  });

  const aiChatFetchedMessages = useAtomFamilyStateValue(
    aiChatFetchedMessagesFamilyState,
    { threadId },
  );

  const setAiChatMessages = useSetAtomFamilyState(aiChatMessagesFamilyState, {
    threadId,
  });

  const aiChatIsStreaming = useAtomFamilyStateValue(
    aiChatIsStreamingFamilyState,
    { threadId },
  );

  const aiChatIsAwaitingPersistedRefetch = useAtomFamilyStateValue(
    aiChatIsAwaitingPersistedRefetchFamilyState,
    { threadId },
  );

  const aiChatIsAwaitingFirstChunk = useAtomFamilyStateValue(
    aiChatIsAwaitingFirstChunkFamilyState,
    { threadId },
  );

  const aiChatThreadRecord = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );

  useEffect(() => {
    const usageAtom = aiChatUsageFamilyState.atomFamily({ threadId });

    if (isDefined(aiChatThreadRecord) && !isDefined(store.get(usageAtom))) {
      store.set(usageAtom, getAiChatUsageFromThread(aiChatThreadRecord));
    }
  }, [store, threadId, aiChatThreadRecord]);

  useEffect(() => {
    if (
      aiChatIsStreaming ||
      aiChatIsAwaitingPersistedRefetch ||
      aiChatIsAwaitingFirstChunk
    ) {
      return;
    }

    setAiChatMessages(aiChatFetchedMessages);
  }, [
    aiChatFetchedMessages,
    aiChatIsStreaming,
    aiChatIsAwaitingPersistedRefetch,
    aiChatIsAwaitingFirstChunk,
    setAiChatMessages,
  ]);

  return null;
};
