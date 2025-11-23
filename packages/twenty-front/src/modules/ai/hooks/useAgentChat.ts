import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';

import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { isAgentChatCurrentContextActiveState } from '@/ai/states/isAgentChatCurrentContextActiveState';

import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { renewToken } from '@/auth/services/AuthService';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useGetObjectMetadataItemById } from '@/object-metadata/hooks/useGetObjectMetadataItemById';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { cookieStorage } from '~/utils/cookie-storage';
import { REST_API_BASE_URL } from '../../apollo/constant/rest-api-base-url';
import { agentChatInputState } from '../states/agentChatInputState';

export const useAgentChat = (uiMessages: ExtendedUIMessage[]) => {
  const setTokenPair = useSetRecoilState(tokenPairState);

  const { getObjectMetadataItemById } = useGetObjectMetadataItemById();

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const isAgentChatCurrentContextActive = useRecoilValue(
    isAgentChatCurrentContextActiveState,
  );

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

        if (response.status !== 401) {
          return response;
        }

        const retriedResponse = await retryFetchWithRenewedToken(input, init);

        return retriedResponse ?? response;
      },
    }),
    messages: uiMessages,
    id: `${currentAIChatThread}-${uiMessages.length}`,
  });

  const isStreaming = status === 'streaming';

  const isLoading =
    !currentAIChatThread || isStreaming || agentChatSelectedFiles.length > 0;

  const handleSendMessage = async (records?: ObjectRecord[]) => {
    if (agentChatInput.trim() === '' || isLoading === true) {
      return;
    }

    const content = agentChatInput.trim();
    setAgentChatInput('');

    const recordIdsByObjectMetadataNameSingular = [];

    if (
      isAgentChatCurrentContextActive === true &&
      isDefined(records) &&
      isDefined(contextStoreCurrentObjectMetadataItemId)
    ) {
      recordIdsByObjectMetadataNameSingular.push({
        objectMetadataNameSingular: getObjectMetadataItemById(
          contextStoreCurrentObjectMetadataItemId,
        ).nameSingular,
        recordIds: records.map(({ id }) => id),
      });
    }

    sendMessage(
      {
        text: content,
        files: agentChatUploadedFiles,
      },
      {
        body: {
          threadId: currentAIChatThread,
          recordIdsByObjectMetadataNameSingular,
        },
      },
    );
    setAgentChatUploadedFiles([]);
  };

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages,
    input: agentChatInput,
    handleSendMessage,
    isLoading,
    isStreaming,
    error,
    handleRetry: regenerate,
  };
};
