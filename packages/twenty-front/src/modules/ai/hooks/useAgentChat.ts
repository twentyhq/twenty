import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { useGetBrowsingContext } from '@/ai/hooks/useBrowsingContext';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { agentChatUsageState } from '@/ai/states/agentChatUsageState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';

import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { renewToken } from '@/auth/services/AuthService';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';
import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { agentChatInputState } from '@/ai/states/agentChatInputState';

export const useAgentChat = (uiMessages: ExtendedUIMessage[]) => {
  const setTokenPair = useSetRecoilState(tokenPairState);
  const setAgentChatUsage = useSetRecoilState(agentChatUsageState);

  const { getBrowsingContext } = useGetBrowsingContext();

  const agentChatSelectedFiles = useRecoilValue(agentChatSelectedFilesState);

  const currentAIChatThread = useRecoilValue(currentAIChatThreadState);

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
        `${REACT_APP_SERVER_BASE_URL}/graphql`,
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

  const { sendMessage, messages, status, error, regenerate } = useChat({
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
        inputCredits: number;
        outputCredits: number;
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
          inputTokens: (prev?.inputTokens ?? 0) + usage.inputTokens,
          outputTokens: (prev?.outputTokens ?? 0) + usage.outputTokens,
          totalTokens:
            (prev?.totalTokens ?? 0) + usage.inputTokens + usage.outputTokens,
          contextWindowTokens: model.contextWindowTokens,
          inputCredits: (prev?.inputCredits ?? 0) + usage.inputCredits,
          outputCredits: (prev?.outputCredits ?? 0) + usage.outputCredits,
        }));
      }
    },
  });

  const isStreaming = status === 'streaming';

  const isLoading =
    !currentAIChatThread || isStreaming || agentChatSelectedFiles.length > 0;

  const handleSendMessage = async () => {
    if (agentChatInput.trim() === '' || isLoading === true) {
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
    isLoading,
    isStreaming,
    error,
    handleRetry: regenerate,
  };
};
