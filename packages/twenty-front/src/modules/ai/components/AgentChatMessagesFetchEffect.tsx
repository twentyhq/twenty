import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { useStore } from 'jotai';
import { useCallback, useMemo } from 'react';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatFetchedMessagesFamilyState } from '@/ai/states/agentChatFetchedMessagesFamilyState';
import { agentChatFirstLiveSeqFamilyState } from '@/ai/states/agentChatFirstLiveSeqFamilyState';
import { agentChatHandleEventCallbackFamilyState } from '@/ai/states/agentChatHandleEventCallbackFamilyState';
import { agentChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatQueuedMessagesFamilyState } from '@/ai/states/agentChatQueuedMessagesFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
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

export const AgentChatMessagesFetchEffect = () => {
  const store = useStore();
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);

  const isNewThread = useMemo(
    () =>
      currentAiChatThread === null ||
      currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    [currentAiChatThread],
  );

  const setAgentChatMessagesLoading = useSetAtomState(
    agentChatMessagesLoadingState,
  );

  const setSkipMessagesSkeletonUntilLoaded = useSetAtomState(
    skipMessagesSkeletonUntilLoadedState,
  );

  const setAgentChatFetchedMessages = useSetAtomFamilyState(
    agentChatFetchedMessagesFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAgentChatQueuedMessages = useSetAtomFamilyState(
    agentChatQueuedMessagesFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAgentChatIsAwaitingPersistedRefetch = useSetAtomFamilyState(
    agentChatIsAwaitingPersistedRefetchFamilyState,
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
        agentChatErrorFamilyState.atomFamily({ threadId: currentAiChatThread }),
      );
      if (isGraphqlErrorOfType(error, 'NOT_FOUND')) {
        return;
      }
      const uiMessages = mapDBMessagesToUIMessages(data.chatMessages ?? []);
      setAgentChatFetchedMessages(
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

      const threadId = store.get(currentAiChatThreadState.atom);

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
      currentAiChatThread,
      setAgentChatFetchedMessages,
      setAgentChatQueuedMessages,
      setAgentChatIsAwaitingPersistedRefetch,
      store,
    ],
  );

  const handleLoadingChange = useCallback(
    (loading: boolean) => {
      setAgentChatMessagesLoading(loading);

      if (!loading) {
        setAgentChatIsAwaitingPersistedRefetch(false);
      }
    },
    [setAgentChatMessagesLoading, setAgentChatIsAwaitingPersistedRefetch],
  );

  const { refetch: refetchAgentChatMessages } = useQueryWithCallbacks(
    GetChatMessagesDocument,
    {
      variables: { threadId: currentAiChatThread ?? '' },
      fetchPolicy: 'network-only',
      skip: !isDefined(currentAiChatThread) || isNewThread,
      onFirstLoad: handleFirstLoad,
      onDataLoaded: handleDataLoaded,
      onLoadingChange: handleLoadingChange,
    },
  );

  const handleRefetchMessages = useCallback(() => {
    if (isNewThread) {
      return;
    }

    refetchAgentChatMessages();
  }, [refetchAgentChatMessages, isNewThread]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
    onBrowserEvent: handleRefetchMessages,
  });

  useListenToBrowserEvent({
    eventName: SSE_CLIENT_RECONNECTED_EVENT_NAME,
    onBrowserEvent: handleRefetchMessages,
  });

  return null;
};
