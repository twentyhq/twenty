import {
  useRecoilCallback,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';

import { GET_CHAT_THREAD } from '@/ai/graphql/queries/getChatThread';
import { useGetBrowsingContext } from '@/ai/hooks/useBrowsingContext';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { currentAIChatThreadTitleState } from '@/ai/states/currentAIChatThreadTitleState';
import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { renewToken } from '@/auth/services/AuthService';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { commandMenuNavigationStackState } from '@/command-menu/states/commandMenuNavigationStackState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useChat } from '@ai-sdk/react';
import { useApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { DefaultChatTransport } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';

type GetChatThreadResult = {
  chatThread: {
    id: string;
    title: string | null;
  };
};

export const useAgentChat = (uiMessages: ExtendedUIMessage[]) => {
  const setTokenPair = useSetRecoilState(tokenPairState);
  const setAgentChatUsage = useSetRecoilState(agentChatUsageState);

  const { getBrowsingContext } = useGetBrowsingContext();
  const apolloClient = useApolloClient();

  const syncAskAIPageTitle = useRecoilCallback(
    ({ snapshot, set }) =>
      (threadId: string, title: string) => {
        const activeThread = snapshot
          .getLoadable(currentAIChatThreadState)
          .getValue();

        if (activeThread !== threadId) {
          return;
        }

        set(currentAIChatThreadTitleState, title);

        const currentPage = snapshot
          .getLoadable(commandMenuPageState)
          .getValue();

        if (currentPage === CommandMenuPages.AskAI) {
          const pageInfo = snapshot
            .getLoadable(commandMenuPageInfoState)
            .getValue();

          set(commandMenuPageInfoState, { ...pageInfo, title });
        }

        const stack = snapshot
          .getLoadable(commandMenuNavigationStackState)
          .getValue();

        const askAIIndex = stack.findLastIndex(
          (item) => item.page === CommandMenuPages.AskAI,
        );

        if (askAIIndex === -1) {
          return;
        }

        const updatedStack = [...stack];

        updatedStack[askAIIndex] = {
          ...updatedStack[askAIIndex],
          pageTitle: title,
        };

        set(commandMenuNavigationStackState, updatedStack);
      },
    [],
  );

  const agentChatSelectedFiles = useRecoilValue(agentChatSelectedFilesState);

  const currentAIChatThread = useRecoilValue(currentAIChatThreadState);
  const currentAIChatThreadTitle = useRecoilValue(
    currentAIChatThreadTitleState,
  );

  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilState(
    agentChatUploadedFilesState,
  );

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

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
    onFinish: async ({ message }) => {
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

      if (
        isDefined(currentAIChatThread) &&
        !isNonEmptyString(currentAIChatThreadTitle)
      ) {
        const maxAttempts = 3;
        const delayMs = 2000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));

          const result = await apolloClient
            .query<GetChatThreadResult>({
              query: GET_CHAT_THREAD,
              variables: { id: currentAIChatThread },
              fetchPolicy: 'network-only',
            })
            .catch(() => null);

          const title = result?.data?.chatThread?.title;

          if (isNonEmptyString(title)) {
            syncAskAIPageTitle(currentAIChatThread, title);
            break;
          }
        }
      }
    },
  });

  const isStreaming = status === 'streaming';

  const isLoading = isStreaming || agentChatSelectedFiles.length > 0;

  const handleSendMessage = async () => {
    if (agentChatInput.trim() === '' || isLoading || !currentAIChatThread) {
      return;
    }

    const content = agentChatInput.trim();
    setAgentChatInput('');

    const browsingContext = getBrowsingContext();

    sendMessage(
      {
        text: content,
        files: agentChatUploadedFiles,
      },
      {
        body: {
          threadId: currentAIChatThread,
          browsingContext,
        },
      },
    );
    setAgentChatUploadedFiles([]);
  };

  return {
    messages,
    handleSendMessage,
    handleStop: stop,
    isLoading,
    isStreaming,
    error,
    handleRetry: regenerate,
  };
};
