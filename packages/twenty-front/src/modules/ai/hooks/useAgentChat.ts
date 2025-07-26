import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { Key } from 'ts-key-enum';

import { currentAIChatThreadComponentState } from '@/ai/states/currentAIChatThreadComponentState';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useScrollWrapperElement } from '@/ui/utilities/scroll/hooks/useScrollWrapperElement';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { STREAM_CHAT_QUERY } from '@/ai/rest-api/agent-chat-apollo.api';
import { AgentChatMessageRole } from '@/ai/constants/agent-chat-message-role';
import { agentChatSelectedFilesComponentState } from '@/ai/states/agentChatSelectedFilesComponentState';
import { agentChatUploadedFilesComponentState } from '@/ai/states/agentChatUploadedFilesComponentState';
import { useApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import {
  useGetAgentChatMessagesQuery,
  useGetAgentChatThreadsQuery,
} from '~/generated-metadata/graphql';
import { AgentChatMessage } from '~/generated/graphql';
import { agentChatInputState } from '../states/agentChatInputState';
import { agentChatMessagesComponentState } from '../states/agentChatMessagesComponentState';
import { agentStreamingMessageState } from '../states/agentStreamingMessageState';
import { parseAgentStreamingChunk } from '../utils/parseAgentStreamingChunk';
import {
  agentChatObjectMetadataAndRecordContextState,
  AIChatObjectMetadataAndRecordContext,
} from '@/ai/states/agentChatObjectMetadataAndRecordContextState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useGetObjectMetadataItemById } from '@/object-metadata/hooks/useGetObjectMetadataItemById';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isAgentChatCurrentContextActiveState } from '@/ai/states/isAgentChatCurrentContextActiveState';

type OptimisticMessage = AgentChatMessage & {
  isPending: boolean;
};

export const useAgentChat = (agentId: string, records?: ObjectRecord[]) => {
  const apolloClient = useApolloClient();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { getObjectMetadataItemById } = useGetObjectMetadataItemById();

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const isAgentChatCurrentContextActive = useRecoilComponentValueV2(
    isAgentChatCurrentContextActiveState,
    agentId,
  );

  const agentChatSelectedFiles = useRecoilComponentValueV2(
    agentChatSelectedFilesComponentState,
    agentId,
  );

  const [agentChatContext, setAgentChatContext] = useRecoilComponentStateV2(
    agentChatObjectMetadataAndRecordContextState,
    agentId,
  );

  const [currentThreadId, setCurrentThreadId] = useRecoilComponentStateV2(
    currentAIChatThreadComponentState,
    agentId,
  );
  const [agentChatUploadedFiles, setAgentChatUploadedFiles] =
    useRecoilComponentStateV2(agentChatUploadedFilesComponentState, agentId);

  const [agentChatMessages, setAgentChatMessages] = useRecoilComponentStateV2(
    agentChatMessagesComponentState,
    agentId,
  );

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

  const [agentStreamingMessage, setAgentStreamingMessage] = useRecoilState(
    agentStreamingMessageState,
  );

  const [isStreaming, setIsStreaming] = useState(false);

  const scrollWrapperId = `scroll-wrapper-ai-chat-${agentId}`;

  const { scrollWrapperHTMLElement } = useScrollWrapperElement(scrollWrapperId);

  const scrollToBottom = () => {
    scrollWrapperHTMLElement?.scroll({
      top: scrollWrapperHTMLElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const { loading: threadsLoading } = useGetAgentChatThreadsQuery({
    variables: { agentId },
    skip: isDefined(currentThreadId),
    onCompleted: (data) => {
      if (data.agentChatThreads.length > 0) {
        setCurrentThreadId(data.agentChatThreads[0].id);
      }
    },
  });

  const { loading: messagesLoading, refetch: refetchMessages } =
    useGetAgentChatMessagesQuery({
      variables: { threadId: currentThreadId as string },
      skip: !isDefined(currentThreadId),
      onCompleted: ({ agentChatMessages }) => {
        setAgentChatMessages(agentChatMessages);
        scrollToBottom();
      },
    });

  const isLoading =
    messagesLoading ||
    threadsLoading ||
    !currentThreadId ||
    isStreaming ||
    agentChatSelectedFiles.length > 0;

  const createOptimisticMessages = (content: string): AgentChatMessage[] => {
    const optimisticUserMessage: OptimisticMessage = {
      id: v4(),
      threadId: currentThreadId as string,
      role: AgentChatMessageRole.USER,
      content,
      createdAt: new Date().toISOString(),
      isPending: true,
      files: agentChatUploadedFiles,
    };

    const optimisticAiMessage: OptimisticMessage = {
      id: v4(),
      threadId: currentThreadId as string,
      role: AgentChatMessageRole.ASSISTANT,
      content: '',
      createdAt: new Date().toISOString(),
      isPending: true,
      files: [],
    };

    return [optimisticUserMessage, optimisticAiMessage];
  };

  const streamAgentResponse = async (content: string) => {
    if (!currentThreadId) {
      return '';
    }

    setIsStreaming(true);

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

    await apolloClient.query({
      query: STREAM_CHAT_QUERY,
      variables: {
        requestBody: {
          threadId: currentThreadId,
          userMessage: content,
          fileIds: agentChatUploadedFiles.map((file) => file.id),
          recordIdsByObjectMetadataNameSingular:
            recordIdsByObjectMetadataNameSingular,
        },
      },
      context: {
        onChunk: (chunk: string) => {
          parseAgentStreamingChunk(chunk, {
            onTextDelta: (message: string) => {
              setAgentStreamingMessage((prev) => ({
                ...prev,
                streamingText: prev.streamingText + message,
              }));
              scrollToBottom();
            },
            onToolCall: (message: string) => {
              setAgentStreamingMessage((prev) => ({
                ...prev,
                toolCall: message,
              }));
              scrollToBottom();
            },
            onError: (message: string) => {
              enqueueErrorSnackBar({
                message,
              });
            },
          });
        },
      },
    });

    setIsStreaming(false);
  };

  const sendChatMessage = async (content: string) => {
    const optimisticMessages = createOptimisticMessages(content);

    setAgentChatMessages((prevMessages) => [
      ...prevMessages,
      ...optimisticMessages,
    ]);

    setAgentChatUploadedFiles([]);

    setTimeout(scrollToBottom, 100);

    await streamAgentResponse(content);

    const { data } = await refetchMessages();

    setAgentChatMessages(data?.agentChatMessages);
    setAgentStreamingMessage({
      toolCall: '',
      streamingText: '',
    });
    scrollToBottom();
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
    messages: agentChatMessages,
    input: agentChatInput,
    context: agentChatContext,
    handleSetContext,
    handleSendMessage,
    isLoading,
    agentStreamingMessage,
    scrollWrapperId,
  };
};
