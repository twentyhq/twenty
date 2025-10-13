import { useRecoilState, useRecoilValue } from 'recoil';

import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import {
  type AIChatObjectMetadataAndRecordContext,
  agentChatContextState,
} from '@/ai/states/agentChatContextState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useChat } from '@ai-sdk/react';
import { agentChatInputState } from '../states/agentChatInputState';

export const useAgentChat = (agentId: string) => {
  const { chat, isLoadingData } = useAgentChatContextOrThrow();

  const agentChatSelectedFiles = useRecoilValue(agentChatSelectedFilesState);

  const [agentChatContext, setAgentChatContext] = useRecoilState(
    agentChatContextState,
  );

  const currentAIChatThread = useRecoilValue(currentAIChatThreadState);

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

  const scrollWrapperId = `scroll-wrapper-ai-chat-${agentId}`;

  const { messages, status, error } = useChat({
    chat,
  });

  const isStreaming = status === 'streaming';

  const isLoading =
    isLoadingData ||
    !currentAIChatThread ||
    isStreaming ||
    agentChatSelectedFiles.length > 0;

  const handleSetContext = async (
    items: Array<AIChatObjectMetadataAndRecordContext>,
  ) => {
    setAgentChatContext(items);
  };

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages,
    input: agentChatInput,
    context: agentChatContext,
    handleSetContext,
    isLoading,
    scrollWrapperId,
    isStreaming,
    error,
  };
};
