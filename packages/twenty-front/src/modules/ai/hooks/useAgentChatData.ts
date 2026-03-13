import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { getOperationName } from '~/utils/getOperationName';
import { useCallback, useEffect, useMemo } from 'react';
import { useStore } from 'jotai';
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
import { focusEditorAfterMigrateState } from '@/ai/states/focusEditorAfterMigrateState';
import { hasTriggeredCreateForDraftState } from '@/ai/states/hasTriggeredCreateForDraftState';
import { isCreatingChatThreadState } from '@/ai/states/isCreatingChatThreadState';
import { isCreatingForFirstSendState } from '@/ai/states/isCreatingForFirstSendState';
import { pendingCreateFromDraftPromiseState } from '@/ai/states/pendingCreateFromDraftPromiseState';
import { skipMessagesSkeletonUntilLoadedState } from '@/ai/states/skipMessagesSkeletonUntilLoadedState';
import { threadIdCreatedFromDraftState } from '@/ai/states/threadIdCreatedFromDraftState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

import {
  type GetChatThreadsQuery,
  GetChatThreadsDocument,
  CreateChatThreadDocument,
  GetChatMessagesDocument,
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
  const setPendingCreateFromDraftPromise = useSetAtomState(
    pendingCreateFromDraftPromiseState,
  );
  const store = useStore();
  const apolloClient = useApolloClient();

  const { scrollToBottom } = useAgentChatScrollToBottom();

  const [createChatThread] = useMutation(CreateChatThreadDocument, {
    onCompleted: (data) => {
      if (store.get(isCreatingForFirstSendState.atom)) {
        store.set(isCreatingForFirstSendState.atom, false);
        setIsCreatingChatThread(false);
        return;
      }

      const newThreadId = data.createChatThread.id;
      const previousDraftKey =
        store.get(currentAIChatThreadState.atom) ??
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
      const draftsSnapshot = store.get(agentChatDraftsByThreadIdState.atom);
      const newDraft = draftsSnapshot[AGENT_CHAT_NEW_THREAD_DRAFT_KEY] ?? '';

      setIsCreatingChatThread(false);
      if (previousDraftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
        store.set(hasTriggeredCreateForDraftState.atom, true);
        setAgentChatDraftsByThreadId((prev) => ({
          ...prev,
          [newThreadId]: newDraft,
          [AGENT_CHAT_NEW_THREAD_DRAFT_KEY]: '',
        }));
        store.set(focusEditorAfterMigrateState.atom, true);
        store.set(skipMessagesSkeletonUntilLoadedState.atom, true);
        store.set(threadIdCreatedFromDraftState.atom, newThreadId);
      } else {
        setAgentChatDraftsByThreadId((prev) => ({
          ...prev,
          [previousDraftKey]: store.get(agentChatInputState.atom),
        }));
      }
      setCurrentAIChatThread(newThreadId);
      setAgentChatInput(newDraft);
      setCurrentAIChatThreadTitle(null);
      setAgentChatUsage(null);

      const newThread = data.createChatThread;
      const threadListVariables = {
        paging: { first: CHAT_THREADS_PAGE_SIZE },
      };
      const existing = apolloClient.cache.readQuery<GetChatThreadsQuery>({
        query: GetChatThreadsDocument,
        variables: threadListVariables,
      });
      if (isDefined(existing) && isDefined(existing.chatThreads)) {
        const newNode = {
          __typename: 'AgentChatThread' as const,
          ...newThread,
          totalInputTokens: 0,
          totalOutputTokens: 0,
          contextWindowTokens: null,
          conversationSize: 0,
          totalInputCredits: 0,
          totalOutputCredits: 0,
        };
        const newEdge = {
          __typename: 'AgentChatThreadEdge' as const,
          node: newNode,
          cursor: newThread.id,
        };
        apolloClient.cache.writeQuery({
          query: GetChatThreadsDocument,
          variables: threadListVariables,
          data: {
            chatThreads: {
              ...existing.chatThreads,
              edges: [newEdge, ...existing.chatThreads.edges],
            },
          },
        });
      }
    },
    onError: () => {
      setIsCreatingChatThread(false);
      store.set(isCreatingForFirstSendState.atom, false);
      store.set(hasTriggeredCreateForDraftState.atom, false);
    },
    refetchQueries: [
      getOperationName(GetChatThreadsDocument) ?? 'GetChatThreads',
    ],
  });

  const { loading: threadsLoading, data: threadsData } = useQuery(
    GetChatThreadsDocument,
    {
      variables: { paging: { first: CHAT_THREADS_PAGE_SIZE } },
      skip: isDefined(currentAIChatThread),
    },
  );

  // TODO: Refactor this useEffect to avoid unnecessary re-renders (see PR #18584 review)
  useEffect(() => {
    if (!threadsData) return;

    const threads = threadsData.chatThreads.edges.map((edge) => edge.node);

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
      store.set(hasTriggeredCreateForDraftState.atom, false);
      setCurrentAIChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
      setAgentChatInput(
        store.get(agentChatDraftsByThreadIdState.atom)[
          AGENT_CHAT_NEW_THREAD_DRAFT_KEY
        ] ?? '',
      );
      setCurrentAIChatThreadTitle(null);
      setAgentChatUsage(null);
    }
  }, [
    threadsData,
    store,
    setCurrentAIChatThread,
    setAgentChatInput,
    setCurrentAIChatThreadTitle,
    setAgentChatUsage,
  ]);

  const isNewThread = useMemo(
    () => currentAIChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
    [currentAIChatThread],
  );

  const { loading: messagesLoading, data } = useQuery(GetChatMessagesDocument, {
    variables: { threadId: currentAIChatThread! },
    skip: !isDefined(currentAIChatThread) || isNewThread,
  });

  // TODO: Refactor this useEffect to avoid unnecessary re-renders (see PR #18584 review)
  useEffect(() => {
    if (data) {
      store.set(skipMessagesSkeletonUntilLoadedState.atom, false);
      scrollToBottom();
    }
  }, [data, store, scrollToBottom]);

  const ensureThreadForDraft = useCallback(() => {
    const current = store.get(currentAIChatThreadState.atom);
    if (current !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
      return;
    }
    const draft =
      store.get(agentChatDraftsByThreadIdState.atom)[
        AGENT_CHAT_NEW_THREAD_DRAFT_KEY
      ] ?? '';
    if (draft.trim() === '') {
      return;
    }
    if (store.get(hasTriggeredCreateForDraftState.atom)) {
      return;
    }
    if (store.get(isCreatingChatThreadState.atom)) {
      return;
    }
    setIsCreatingChatThread(true);
    const createPromise = createChatThread();
    const threadIdPromise = createPromise.then(
      (result) => result?.data?.createChatThread?.id ?? null,
    );
    setPendingCreateFromDraftPromise(threadIdPromise);
    threadIdPromise.finally(() => {
      setPendingCreateFromDraftPromise(null);
    });
  }, [
    createChatThread,
    setPendingCreateFromDraftPromise,
    store,
    setIsCreatingChatThread,
  ]);

  const ensureThreadIdForSend = useCallback(async (): Promise<
    string | null
  > => {
    const current = store.get(currentAIChatThreadState.atom);
    if (current !== AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
      return current;
    }
    const inFlightCreate = store.get(pendingCreateFromDraftPromiseState.atom);
    if (
      store.get(isCreatingChatThreadState.atom) &&
      isDefined(inFlightCreate)
    ) {
      try {
        const threadId = await inFlightCreate;
        return threadId;
      } catch {
        return null;
      }
    }
    store.set(isCreatingForFirstSendState.atom, true);
    setIsCreatingChatThread(true);
    try {
      const result = await createChatThread();
      return result?.data?.createChatThread?.id ?? null;
    } catch {
      return null;
    } finally {
      setIsCreatingChatThread(false);
    }
  }, [createChatThread, store, setIsCreatingChatThread]);

  const threadsLoadingMemoized = useMemo(
    () => threadsLoading,
    [threadsLoading],
  );

  const messagesLoadingMemoized = useMemo(
    () => messagesLoading,
    [messagesLoading],
  );

  const uiMessages = useMemo(
    () => mapDBMessagesToUIMessages(data?.chatMessages || []),
    [data?.chatMessages],
  );

  const isLoading = useMemo(
    () => messagesLoadingMemoized || threadsLoadingMemoized,
    [messagesLoadingMemoized, threadsLoadingMemoized],
  );

  return {
    uiMessages,
    isLoading,
    threadsLoading: threadsLoadingMemoized,
    messagesLoading: messagesLoadingMemoized,
    ensureThreadForDraft,
    ensureThreadIdForSend,
  };
};
