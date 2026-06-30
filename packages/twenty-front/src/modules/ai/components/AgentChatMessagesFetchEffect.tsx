import { useStore } from 'jotai';
import { useCallback, useMemo } from 'react';
import { type AgentChatSubscriptionEvent } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatFetchedMessagesComponentFamilyState } from '@/ai/states/agentChatFetchedMessagesComponentFamilyState';
import { agentChatFirstLiveSeqComponentFamilyState } from '@/ai/states/agentChatFirstLiveSeqComponentFamilyState';
import { agentChatHandleEventCallbackComponentFamilyState } from '@/ai/states/agentChatHandleEventCallbackComponentFamilyState';
import { agentChatIsAwaitingPersistedRefetchComponentFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchComponentFamilyState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { agentChatQueuedMessagesComponentFamilyState } from '@/ai/states/agentChatQueuedMessagesComponentFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomComponentFamilyStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  GetChatMessagesDocument,
  type GetChatMessagesQuery,
} from '~/generated-metadata/graphql';

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

  const setAgentChatFetchedMessages = useSetAtomComponentFamilyState(
    agentChatFetchedMessagesComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAgentChatQueuedMessages = useSetAtomComponentFamilyState(
    agentChatQueuedMessagesComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const setAgentChatIsAwaitingPersistedRefetch = useSetAtomComponentFamilyState(
    agentChatIsAwaitingPersistedRefetchComponentFamilyState,
    { threadId: currentAiChatThread },
  );

  const handleEventCallbackFamilyCallback =
    useAtomComponentFamilyStateCallbackState(
      agentChatHandleEventCallbackComponentFamilyState,
    );
  const firstLiveSeqFamilyCallback = useAtomComponentFamilyStateCallbackState(
    agentChatFirstLiveSeqComponentFamilyState,
  );

  const handleFirstLoad = useCallback(
    (_data: GetChatMessagesQuery) => {
      setSkipMessagesSkeletonUntilLoaded(false);
    },
    [setSkipMessagesSkeletonUntilLoaded],
  );

  const handleDataLoaded = useCallback(
    (data: GetChatMessagesQuery) => {
      const uiMessages = mapDBMessagesToUIMessages(data.chatMessages ?? []);
      setAgentChatFetchedMessages(
        uiMessages.filter((message) => message.status !== 'queued'),
      );
      setAgentChatQueuedMessages(
        uiMessages.filter((message) => message.status === 'queued'),
      );
      setAgentChatIsAwaitingPersistedRefetch(false);

      const catchup = data.chatStreamCatchupChunks;

      if (!isDefined(catchup) || catchup.chunks.length === 0) {
        return;
      }

      const threadId = store.get(currentAiChatThreadState.atom);

      if (!isDefined(threadId)) {
        return;
      }

      const familyKey = { threadId };

      const handleEvent = store.get(
        handleEventCallbackFamilyCallback(familyKey),
      );

      if (!isDefined(handleEvent)) {
        return;
      }

      const firstLiveSeq = store.get(firstLiveSeqFamilyCallback(familyKey));

      for (let index = 0; index < catchup.chunks.length; index++) {
        const chunkSeq = index + 1;

        if (firstLiveSeq !== null && chunkSeq >= firstLiveSeq) {
          break;
        }

        handleEvent({
          type: 'stream-chunk',
          chunk: catchup.chunks[index],
          seq: chunkSeq,
        } as AgentChatSubscriptionEvent);
      }
    },
    [
      setAgentChatFetchedMessages,
      setAgentChatQueuedMessages,
      setAgentChatIsAwaitingPersistedRefetch,
      store,
      handleEventCallbackFamilyCallback,
      firstLiveSeqFamilyCallback,
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

  return null;
};
