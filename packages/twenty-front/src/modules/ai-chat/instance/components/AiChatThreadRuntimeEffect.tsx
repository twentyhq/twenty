import { useStore } from 'jotai';
import { useCallback, useEffect } from 'react';
import { mapAgentMessagesToUIMessages } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai-chat/constants/AiChatRefetchMessagesEventName';
import { useAiChatSubscription } from '@/ai-chat/instance/hooks/useAiChatSubscription';
import { aiChatMessageReactionRevisionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionRevisionsFamilyState';
import { aiChatMessageReactionsFamilyState } from '@/ai-chat/states/server/aiChatMessageReactionsFamilyState';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadFetchedMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadFetchedMessagesFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadRecordFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadRecordFamilySelector';
import { type AiChatThreadEventDetail } from '@/ai-chat/types/AiChatThreadEventDetail';
import { aiChatThreadUsageFamilyState } from '@/ai-chat/states/server/aiChatThreadUsageFamilyState';
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

      applyStreamCatchup(catchup);
    },
    [threadId, applyStreamCatchup, setAiChatThreadFetchedMessages, store],
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

  const aiChatThreadFetchedMessages = useAtomFamilyStateValue(
    aiChatThreadFetchedMessagesFamilyState,
    { threadId },
  );

  const setAiChatThreadDisplayedMessages = useSetAtomFamilyState(
    aiChatThreadDisplayedMessagesFamilyState,
    {
      threadId,
    },
  );

  const aiChatThreadReplyStatus = useAtomFamilyStateValue(
    aiChatThreadReplyStatusFamilyState,
    { threadId },
  );

  const aiChatThreadIsFetchingMessages = useAtomFamilyStateValue(
    aiChatThreadIsFetchingMessagesFamilyState,
    { threadId },
  );

  const aiChatThreadRecord = useAtomFamilySelectorValue(
    aiChatThreadRecordFamilySelector,
    threadId,
  );

  useEffect(() => {
    const usageAtom = aiChatThreadUsageFamilyState.atomFamily({
      threadId,
    });

    if (isDefined(aiChatThreadRecord) && !isDefined(store.get(usageAtom))) {
      store.set(usageAtom, getAiChatUsageFromThread(aiChatThreadRecord));
    }
  }, [store, threadId, aiChatThreadRecord]);

  useEffect(() => {
    if (aiChatThreadReplyStatus !== 'idle' || aiChatThreadIsFetchingMessages) {
      return;
    }

    setAiChatThreadDisplayedMessages(aiChatThreadFetchedMessages.messages);
  }, [
    aiChatThreadFetchedMessages,
    aiChatThreadReplyStatus,
    aiChatThreadIsFetchingMessages,
    setAiChatThreadDisplayedMessages,
  ]);

  return null;
};
