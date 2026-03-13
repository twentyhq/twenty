import { useStore } from 'jotai';
import { useCallback, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_UNKNOWN_THREAD_ID } from '@/ai/constants/AgentChatUnknownThreadId';
import { AI_CHAT_SCROLL_WRAPPER_ID } from '@/ai/constants/AiChatScrollWrapperId';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';

import { useGetChatMessagesQuery } from '~/generated-metadata/graphql';

export const useAgentChatMessagesQuery = (currentAIChatThread: string) => {
  const store = useStore();

  const isNewThread = useMemo(
    () => currentAIChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    [currentAIChatThread],
  );

  const scrollToBottom = useCallback(() => {
    const scrollWrapperElement = document.getElementById(
      `scroll-wrapper-${AI_CHAT_SCROLL_WRAPPER_ID}`,
    );

    if (isDefined(scrollWrapperElement)) {
      scrollWrapperElement.scrollTo({
        top: scrollWrapperElement.scrollHeight,
      });
    }
  }, []);

  const { loading: messagesLoading, data } = useGetChatMessagesQuery({
    variables: { threadId: currentAIChatThread },
    skip: currentAIChatThread === AGENT_CHAT_UNKNOWN_THREAD_ID || isNewThread,
    onCompleted: () => {
      store.set(skipMessagesSkeletonUntilLoadedState.atom, false);
      scrollToBottom();
    },
  });

  const uiMessages = useMemo(
    () => mapDBMessagesToUIMessages(data?.chatMessages || []),
    [data?.chatMessages],
  );

  return { messagesLoading, uiMessages };
};
