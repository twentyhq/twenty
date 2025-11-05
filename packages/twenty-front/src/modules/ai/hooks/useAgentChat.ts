import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilState, useRecoilValue } from 'recoil';

import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { isAgentChatCurrentContextActiveState } from '@/ai/states/isAgentChatCurrentContextActiveState';

import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useGetObjectMetadataItemById } from '@/object-metadata/hooks/useGetObjectMetadataItemById';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { REST_API_BASE_URL } from '../../apollo/constant/rest-api-base-url';
import { agentChatInputState } from '../states/agentChatInputState';

export const useAgentChat = (uiMessages: ExtendedUIMessage[]) => {
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

  const scrollWrapperId = `scroll-wrapper-ai-chat-${currentAIChatThread}`;

  const { scrollWrapperHTMLElement } =
    useScrollWrapperHTMLElement(scrollWrapperId);

  const { sendMessage, messages, status, error, regenerate } = useChat({
    transport: new DefaultChatTransport({
      api: `${REST_API_BASE_URL}/agent-chat/stream`,
      headers: () => ({
        Authorization: `Bearer ${getTokenPair()?.accessOrWorkspaceAgnosticToken.token}`,
      }),
    }),
    messages: uiMessages,
    id: `${currentAIChatThread}-${uiMessages.length}`,
  });

  const isStreaming = status === 'streaming';

  const scrollToBottom = () => {
    scrollWrapperHTMLElement?.scroll({
      top: scrollWrapperHTMLElement.scrollHeight,
      behavior: 'smooth',
    });
  };

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
    setTimeout(scrollToBottom, 100);
  };

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages,
    input: agentChatInput,
    handleSendMessage,
    isLoading,
    scrollWrapperId,
    isStreaming,
    error,
    handleRetry: regenerate,
  };
};
