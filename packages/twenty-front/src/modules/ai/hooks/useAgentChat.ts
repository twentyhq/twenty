import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import {
  type AIChatObjectMetadataAndRecordContext,
  agentChatObjectMetadataAndRecordContextState,
} from '@/ai/states/agentChatObjectMetadataAndRecordContextState';
import { agentChatSelectedFilesComponentState } from '@/ai/states/agentChatSelectedFilesComponentState';
import { agentChatUploadedFilesComponentState } from '@/ai/states/agentChatUploadedFilesComponentState';
import { currentAIChatThreadComponentState } from '@/ai/states/currentAIChatThreadComponentState';
import { isAgentChatCurrentContextActiveState } from '@/ai/states/isAgentChatCurrentContextActiveState';
import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useGetObjectMetadataItemById } from '@/object-metadata/hooks/useGetObjectMetadataItemById';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useScrollWrapperHTMLElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import { REST_API_BASE_URL } from '../../apollo/constant/rest-api-base-url';
import { agentChatInputState } from '../states/agentChatInputState';

export const useAgentChat = (
  agentId: string,
  uiMessages: UIMessageWithMetadata[],
) => {
  const { getObjectMetadataItemById } = useGetObjectMetadataItemById();

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const { records } = useFindManyRecordsSelectedInContextStore({
    limit: 10,
  });

  const isAgentChatCurrentContextActive = useRecoilComponentValue(
    isAgentChatCurrentContextActiveState,
    agentId,
  );

  const agentChatSelectedFiles = useRecoilComponentValue(
    agentChatSelectedFilesComponentState,
    agentId,
  );

  const [agentChatContext, setAgentChatContext] = useRecoilComponentState(
    agentChatObjectMetadataAndRecordContextState,
    agentId,
  );

  const currentThreadId = useRecoilComponentValue(
    currentAIChatThreadComponentState,
    agentId,
  );

  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentState(agentChatUploadedFilesComponentState, agentId);

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

  const scrollWrapperId = `scroll-wrapper-ai-chat-${agentId}`;

  const { scrollWrapperHTMLElement } =
    useScrollWrapperHTMLElement(scrollWrapperId);

  const { enqueueErrorSnackBar } = useSnackBar();

  const { sendMessage, messages, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `${REST_API_BASE_URL}/agent-chat/stream`,
      headers: () => ({
        Authorization: `Bearer ${getTokenPair()?.accessOrWorkspaceAgnosticToken.token}`,
      }),
    }),
    messages: uiMessages,
    id: currentThreadId as string,
    onError: (error) => {
      enqueueErrorSnackBar({ message: error.message });
    },
  });

  const isStreaming = status === 'streaming';

  const scrollToBottom = () => {
    scrollWrapperHTMLElement?.scroll({
      top: scrollWrapperHTMLElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const isLoading =
    !currentThreadId || isStreaming || agentChatSelectedFiles.length > 0;

  const sendChatMessage = async (content: string) => {
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
          threadId: currentThreadId,
          recordIdsByObjectMetadataNameSingular,
        },
      },
    );

    setAgentChatUploadedFiles([]);
    setTimeout(scrollToBottom, 100);
  };

  const handleSendMessage = async () => {
    if (agentChatInput.trim() === '' || isLoading === true) {
      return;
    }
    const content = agentChatInput.trim();
    setAgentChatInput('');
    await sendChatMessage(content);
  };

  const handleSetContext = async (
    items: Array<AIChatObjectMetadataAndRecordContext>,
  ) => {
    setAgentChatContext(items);
  };

  useHotkeysOnFocusedElement({
    keys: [Key.Enter],
    callback: (event: KeyboardEvent) => {
      if (!event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    focusId: `${agentId}-chat-input`,
    dependencies: [agentChatInput, isLoading],
    options: {
      enableOnFormTags: true,
    },
  });

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages,
    input: agentChatInput,
    context: agentChatContext,
    handleSetContext,
    handleSendMessage,
    isLoading,
    scrollWrapperId,
    isStreaming,
    error,
  };
};
