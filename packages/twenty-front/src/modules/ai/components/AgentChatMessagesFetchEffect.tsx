import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { AGENT_CHAT_UNKNOWN_THREAD_ID } from '@/ai/constants/AgentChatUnknownThreadId';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatFetchedMessagesComponentFamilyState } from '@/ai/states/agentChatFetchedMessagesComponentFamilyState';
import { agentChatMessagesLoadingState } from '@/ai/states/agentChatMessagesLoadingState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { useQueryWithCallbacks } from '@/apollo/hooks/useQueryWithCallbacks';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import {
  GetChatMessagesDocument,
  type GetChatMessagesQuery,
} from '~/generated-metadata/graphql';

export const AgentChatMessagesFetchEffect = () => {
  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const isNewThread = useMemo(
    () =>
      currentAIChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY ||
      currentAIChatThread === AGENT_CHAT_UNKNOWN_THREAD_ID,
    [currentAIChatThread],
  );

  const setAgentChatMessagesLoading = useSetAtomState(
    agentChatMessagesLoadingState,
  );

  const setSkipMessagesSkeletonUntilLoaded = useSetAtomState(
    skipMessagesSkeletonUntilLoadedState,
  );

  const setAgentChatFetchedMessages = useSetAtomComponentFamilyState(
    agentChatFetchedMessagesComponentFamilyState,
    { threadId: currentAIChatThread },
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
      setAgentChatFetchedMessages(uiMessages);
    },
    [setAgentChatFetchedMessages],
  );

  const handleLoadingChange = useCallback(
    (loading: boolean) => {
      setAgentChatMessagesLoading(loading);
    },
    [setAgentChatMessagesLoading],
  );

  const { refetch: refetchAgentChatMessages } = useQueryWithCallbacks(
    GetChatMessagesDocument,
    {
      variables: { threadId: currentAIChatThread },
      skip: !isDefined(currentAIChatThread) || isNewThread,
      onFirstLoad: handleFirstLoad,
      onDataLoaded: handleDataLoaded,
      onLoadingChange: handleLoadingChange,
    },
  );

  const handleRefetchMessages = useCallback(() => {
    refetchAgentChatMessages();
  }, [refetchAgentChatMessages]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME,
    onBrowserEvent: handleRefetchMessages,
  });

  return null;
};
