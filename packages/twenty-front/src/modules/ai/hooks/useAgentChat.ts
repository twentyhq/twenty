import { AGENT_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { useApolloClient } from '@apollo/client/react';

import { useGetBrowsingContext } from '@/ai/hooks/useBrowsingContext';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';

import { AGENT_CHAT_RETRY_EVENT_NAME } from '@/ai/constants/AgentChatRetryEventName';
import { AGENT_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { renewToken } from '@/auth/services/AuthService';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useStore } from 'jotai';
import { useCallback, useState } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';

export const useAgentChat = (
  uiMessages: ExtendedUIMessage[],
  ensureThreadIdForSend: () => Promise<string | null>,
) => {
  const setTokenPair = useSetAtomState(tokenPairState);
  const setAgentChatUsage = useSetAtomState(agentChatUsageState);

  const { getBrowsingContext } = useGetBrowsingContext();
  const setCurrentAIChatThreadTitle = useSetAtomState(
    currentAIChatThreadTitleState,
  );
  const setCurrentAIChatThread = useSetAtomState(currentAIChatThreadState);
  const apolloClient = useApolloClient();
  const store = useStore();

  const agentChatSelectedFiles = useAtomStateValue(agentChatSelectedFilesState);

  const currentAIChatThread = useAtomStateValue(currentAIChatThreadState);

  const [, setPendingThreadIdAfterFirstSend] = useState<string | null>(null);

  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useAtomState(
    agentChatUploadedFilesState,
  );

  const [, setAgentChatInput] = useAtomState(agentChatInputState);
  const setAgentChatDraftsByThreadId = useSetAtomState(
    agentChatDraftsByThreadIdState,
  );

  const retryFetchWithRenewedToken = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    const tokenPair = getTokenPair();

    if (!isDefined(tokenPair)) {
      return null;
    }

    try {
      const renewedTokens = await renewToken(
        `${REACT_APP_SERVER_BASE_URL}/metadata`,
        tokenPair,
      );

      if (!isDefined(renewedTokens)) {
        setTokenPair(null);
        return null;
      }

      const renewedAccessToken =
        renewedTokens.accessOrWorkspaceAgnosticToken?.token;

      if (!isDefined(renewedAccessToken)) {
        setTokenPair(null);
        return null;
      }

      cookieStorage.setItem('tokenPair', JSON.stringify(renewedTokens));
      setTokenPair(renewedTokens);

      const updatedHeaders = new Headers(init?.headers ?? {});
      updatedHeaders.set('Authorization', `Bearer ${renewedAccessToken}`);

      return fetch(input, {
        ...init,
        headers: updatedHeaders,
      });
    } catch {
      setTokenPair(null);
      return null;
    }
  };

  const { sendMessage, messages, status, error, regenerate, stop } = useChat({
    transport: new DefaultChatTransport({
      api: `${REST_API_BASE_URL}/agent-chat/stream`,
      headers: () => ({
        Authorization: `Bearer ${getTokenPair()?.accessOrWorkspaceAgnosticToken.token}`,
      }),
      fetch: async (input, init) => {
        const response = await fetch(input, init);

        if (response.status === 401) {
          const retriedResponse = await retryFetchWithRenewedToken(input, init);

          return retriedResponse ?? response;
        }

        // For non-2xx responses, parse the error body and throw with the code
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const error = new Error(
            errorBody.messages?.[0] ||
              `Request failed with status ${response.status}`,
          ) as Error & { code?: string };

          if (isDefined(errorBody.code)) {
            error.code = errorBody.code;
          }
          throw error;
        }

        return response;
      },
    }),
    messages: uiMessages,
    id: `${currentAIChatThread}-${uiMessages.length}`,
    experimental_throttle: 100,
    onFinish: ({ message }) => {
      type UsageMetadata = {
        inputTokens: number;
        outputTokens: number;
        cachedInputTokens: number;
        inputCredits: number;
        outputCredits: number;
        conversationSize: number;
      };
      type ModelMetadata = {
        contextWindowTokens: number;
      };
      const metadata = message.metadata as
        | { usage?: UsageMetadata; model?: ModelMetadata }
        | undefined;
      const usage = metadata?.usage;
      const model = metadata?.model;

      if (isDefined(usage) && isDefined(model)) {
        setAgentChatUsage((prev) => ({
          lastMessage: {
            inputTokens: usage.inputTokens,
            outputTokens: usage.outputTokens,
            cachedInputTokens: usage.cachedInputTokens,
            inputCredits: usage.inputCredits,
            outputCredits: usage.outputCredits,
          },
          conversationSize: usage.conversationSize,
          contextWindowTokens: model.contextWindowTokens,
          inputTokens: (prev?.inputTokens ?? 0) + usage.inputTokens,
          outputTokens: (prev?.outputTokens ?? 0) + usage.outputTokens,
          inputCredits: (prev?.inputCredits ?? 0) + usage.inputCredits,
          outputCredits: (prev?.outputCredits ?? 0) + usage.outputCredits,
        }));
      }

      const titlePart = message.parts.find(
        (part) => part.type === 'data-thread-title',
      );

      setPendingThreadIdAfterFirstSend((pendingId) => {
        const threadIdForTitle = pendingId ?? currentAIChatThread;
        if (isDefined(titlePart) && titlePart.type === 'data-thread-title') {
          setCurrentAIChatThreadTitle(titlePart.data.title);
          if (isDefined(threadIdForTitle)) {
            const threadRef = apolloClient.cache.identify({
              __typename: 'AgentChatThread',
              id: threadIdForTitle,
            });
            if (isDefined(threadRef)) {
              apolloClient.cache.modify({
                id: threadRef,
                fields: {
                  title: () => titlePart.data.title,
                },
              });
            }
          }
        }
        if (isDefined(pendingId)) {
          setCurrentAIChatThread(pendingId);
        }
        return null;
      });
    },
  });

  const isStreaming = status === 'streaming';
  const isLoading = isStreaming || agentChatSelectedFiles.length > 0;

  const handleSendMessage = useCallback(async () => {
    const draftKey =
      store.get(currentAIChatThreadState.atom) ??
      AGENT_CHAT_NEW_THREAD_DRAFT_KEY;
    const contentToSend =
      draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY
        ? (
            store.get(agentChatDraftsByThreadIdState.atom)[
              AGENT_CHAT_NEW_THREAD_DRAFT_KEY
            ] ?? store.get(agentChatInputState.atom)
          ).trim()
        : store.get(agentChatInputState.atom).trim();

    if (contentToSend === '' || isLoading) {
      return;
    }

    const threadId = await ensureThreadIdForSend();
    if (!threadId) {
      return;
    }

    if (draftKey === AGENT_CHAT_NEW_THREAD_DRAFT_KEY) {
      setPendingThreadIdAfterFirstSend(threadId);
    }

    setAgentChatInput('');
    setAgentChatDraftsByThreadId((prev) => ({
      ...prev,
      [draftKey]: '',
    }));

    const browsingContext = getBrowsingContext();

    sendMessage(
      {
        text: contentToSend,
        files: agentChatUploadedFiles,
      },
      {
        body: {
          threadId,
          browsingContext,
        },
      },
    );

    setAgentChatUploadedFiles([]);
  }, [
    store,
    isLoading,
    ensureThreadIdForSend,
    setAgentChatInput,
    getBrowsingContext,
    sendMessage,
    agentChatUploadedFiles,
    setAgentChatUploadedFiles,
    setAgentChatDraftsByThreadId,
  ]);

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_STOP_EVENT_NAME,
    onBrowserEvent: stop,
  });

  useListenToBrowserEvent({
    eventName: AGENT_CHAT_RETRY_EVENT_NAME,
    onBrowserEvent: regenerate,
  });

  return {
    messages,
    handleSendMessage,
    handleStop: stop,
    isLoading,
    error,
    status,
  };
};
