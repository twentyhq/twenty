import { useSetRecoilState } from 'recoil';

import { useGetBrowsingContext } from '@/ai/hooks/useBrowsingContext';
import { agentChatSelectedFilesStateV2 } from '@/ai/states/agentChatSelectedFilesStateV2';
import { agentChatUploadedFilesStateV2 } from '@/ai/states/agentChatUploadedFilesStateV2';
import { agentChatUsageStateV2 } from '@/ai/states/agentChatUsageStateV2';
import { currentAIChatThreadStateV2 } from '@/ai/states/currentAIChatThreadStateV2';
import { currentAIChatThreadTitleStateV2 } from '@/ai/states/currentAIChatThreadTitleStateV2';

import { agentChatInputStateV2 } from '@/ai/states/agentChatInputStateV2';
import { useRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { renewToken } from '@/auth/services/AuthService';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';

export const useAgentChat = (uiMessages: ExtendedUIMessage[]) => {
  const setTokenPair = useSetRecoilState(tokenPairState);
  const setAgentChatUsage = useSetRecoilStateV2(agentChatUsageStateV2);

  const { getBrowsingContext } = useGetBrowsingContext();
  const setCurrentAIChatThreadTitle = useSetRecoilStateV2(
    currentAIChatThreadTitleStateV2,
  );

  const agentChatSelectedFiles = useRecoilValueV2(
    agentChatSelectedFilesStateV2,
  );

  const currentAIChatThread = useRecoilValueV2(currentAIChatThreadStateV2);

  const [agentChatUploadedFiles, setAgentChatUploadedFiles] = useRecoilStateV2(
    agentChatUploadedFilesStateV2,
  );

  const [agentChatInput, setAgentChatInput] = useRecoilStateV2(
    agentChatInputStateV2,
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

      if (isDefined(titlePart) && titlePart.type === 'data-thread-title') {
        setCurrentAIChatThreadTitle(titlePart.data.title);
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
