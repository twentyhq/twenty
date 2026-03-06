import { getOperationName } from '@apollo/client/utilities';
import { useStore } from 'jotai';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CHAT_THREADS_PAGE_SIZE } from '@/ai/constants/ChatThreads';
import { useAgentChatScrollToBottom } from '@/ai/hooks/useAgentChatScrollToBottom';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import {
  GetChatThreadsDocument,
  useCreateChatThreadMutation,
  useGetChatMessagesQuery,
  useGetChatThreadsQuery,
} from '~/generated-metadata/graphql';

export const useAgentChatData = () => {
  const [currentAIChatThread, setCurrentAIChatThread] = useAtomState(
    currentAIChatThreadState,
  );
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const [, setIsCreatingChatThread] = useAtomState(isCreatingChatThreadState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );
  const [, setCreatingForFirstSend] = useState(false);
  const store = useStore();

  const { scrollToBottom } = useAgentChatScrollToBottom();

  const [createChatThread] = useCreateChatThreadMutation({
    onCompleted: (data) => {
      setCreatingForFirstSend((prev) => {
        const previousDraftKey =
          store.get(currentAIChatThreadState.atom) ??
          AGENT_CHAT_NEW_THREAD_DRAFT_KEY;

        if (prev) {
          setIsCreatingChatThread(false);
          setAgentChatDraftsByThreadId((drafts) => ({
            ...drafts,
            [previousDraftKey]: store.get(agentChatInputState.atom),
          }));
          return false;
        }

        const newThreadId = data.createChatThread.id;
        const newDraft =
          store.get(agentChatDraftsByThreadIdState.atom)[
            AGENT_CHAT_NEW_THREAD_DRAFT_KEY
          ] ?? '';
        setIsCreatingChatThread(false);
        setAgentChatDraftsByThreadId((drafts) => ({
          ...drafts,
          [previousDraftKey]: store.get(agentChatInputState.atom),
        }));
        setCurrentAIChatThread(newThreadId);
        setAgentChatInput(newDraft);
        setCurrentAIChatThreadTitle(null);
        setAgentChatUsage(null);
        return false;
      });
    },
    onError: () => {
      setIsCreatingChatThread(false);
    },
    refetchQueries: [
      getOperationName(GetChatThreadsDocument) ?? 'GetChatThreads',
    ],
  });

  const { loading: threadsLoading } = useGetChatThreadsQuery({
    variables: { paging: { first: CHAT_THREADS_PAGE_SIZE } },
    skip: isDefined(currentAIChatThread),
    onCompleted: (data) => {
      const threads = data.chatThreads.edges.map((edge) => edge.node);

      if (threads.length > 0) {
        const firstThread = threads[0];
        const newDraft =
          store.get(agentChatDraftsByThreadIdState.atom)[firstThread.id] ?? '';

        setCurrentAIChatThread(firstThread.id);
        setAgentChatInput(newDraft);
        setCurrentAIChatThreadTitle(firstThread.title ?? null);

        const hasUsageData =
          (firstThread.conversationSize ?? 0) > 0 &&
          isDefined(firstThread.contextWindowTokens);
        setAgentChatUsage(
          hasUsageData
            ? {
                lastMessage: null,
                conversationSize: firstThread.conversationSize ?? 0,
                contextWindowTokens: firstThread.contextWindowTokens ?? 0,
                inputTokens: firstThread.totalInputTokens,
                outputTokens: firstThread.totalOutputTokens,
                inputCredits: firstThread.totalInputCredits,
                outputCredits: firstThread.totalOutputCredits,
              }
            : null,
        );
      } else {
        setCurrentAIChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
        setAgentChatInput(
          store.get(agentChatDraftsByThreadIdState.atom)[
            AGENT_CHAT_NEW_THREAD_DRAFT_KEY
          ] ?? '',
        );
        setCurrentAIChatThreadTitle(null);
        setAgentChatUsage(null);
      }
    },
  });

  const isNewThread = currentAIChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
  const { loading: messagesLoading, data } = useGetChatMessagesQuery({
    variables: { threadId: currentAIChatThread! },
    skip: !isDefined(currentAIChatThread) || isNewThread,
    onCompleted: scrollToBottom,
  });

  const uiMessages = mapDBMessagesToUIMessages(data?.chatMessages || []);
  const isLoading = messagesLoading || threadsLoading;

  const ensureThreadIdForSend = async (): Promise<string | null> => {
    const current = store.get(currentAIChatThreadState.atom);
    if (current !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
      return current;
    }
    setCreatingForFirstSend(true);
    setIsCreatingChatThread(true);
    try {
      const result = await createChatThread();
      return result?.data?.createChatThread?.id ?? null;
    } catch {
      setCreatingForFirstSend(false);
      return null;
    } finally {
      setIsCreatingChatThread(false);
    }
  };

  return {
    uiMessages,
    isLoading,
    ensureThreadIdForSend,
  };
};
