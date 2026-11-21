import { useStore } from 'jotai';
import { useCallback } from 'react';
import { mapAgentMessagesToUIMessages } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai-chat/constants/AiChatRefetchMessagesEventName';
import { AI_CHAT_STREAM_CATCHUP_EVENT_NAME } from '@/ai-chat/constants/AiChatStreamCatchupEventName';
import { aiChatMessageReactionRevisionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { type AiChatStreamCatchupEventDetail } from '@/ai-chat/types/AiChatStreamCatchupEventDetail';
import { type AiChatThreadEventDetail } from '@/ai-chat/types/AiChatThreadEventDetail';
import { SSE_CLIENT_RECONNECTED_EVENT_NAME } from '@/sse-db-event/constants/SseClientReconnectedEventName';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  GetChatMessagesDocument,
  type GetChatMessagesQuery,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

type AiChatThreadMessagesLoadEffectProps = {
  threadId: string;
};

export const AiChatThreadMessagesLoadEffect = ({
  threadId,
}: AiChatThreadMessagesLoadEffectProps) => {
  const store = useStore();
  const newAiChatThreadId = useAtomStateValue(newAiChatThreadIdState);

  const isNewThread = threadId === newAiChatThreadId;

  const setAiChatThreadIsFetchingMessages = useSetAtomFamilyState(
    aiChatThreadIsFetchingMessagesFamilyState,
    { threadId },
  );

  const setAiChatThreadFetchedMessages = useSetAtomFamilyState(
    aiChatThreadFetchedMessagesFamilyState,
    { threadId },
  );

  const handleDataLoaded = useCallback(
    (data: GetChatMessagesQuery) => {
      const error = store.get(
        aiChatThreadReplyErrorFamilyState.atomFamily({ threadId }),
      );
      if (isGraphqlErrorOfType(error, 'NOT_FOUND')) {
        return;
      }
      const uiMessages = mapAgentMessagesToUIMessages(data.chatMessages ?? []);
      // A live snapshot is at least as recent as a fetch, which may have been read before it
      const liveReactionRevisions = store.get(
        aiChatMessageReactionRevisionsFamilyState.atomFamily({
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
      setAiChatThreadFetchedMessages({
        messages: uiMessages.filter((message) => message.status !== 'queued'),
        queuedMessages: uiMessages.filter(
          (message) => message.status === 'queued',
        ),
      });
      const catchup = data.chatStreamCatchupChunks;

      if (!isDefined(catchup)) {
        return;
      }

      dispatchBrowserEvent<AiChatStreamCatchupEventDetail>(
        AI_CHAT_STREAM_CATCHUP_EVENT_NAME,
        { threadId, catchup },
      );
    },
    [threadId, setAiChatThreadFetchedMessages, store],
  );

  const handleLoadingChange = useCallback(
    (loading: boolean) => setAiChatThreadIsFetchingMessages(loading),
    [setAiChatThreadIsFetchingMessages],
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
      aiChatMessageReactionRevisionsFamilyState.atomFamily({
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

  return null;
};
