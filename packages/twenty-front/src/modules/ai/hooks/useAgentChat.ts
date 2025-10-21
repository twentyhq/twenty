import { useRecoilState, useRecoilValue } from 'recoil';

import { useAgentChatContextOrThrow } from '@/ai/hooks/useAgentChatContextOrThrow';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { useChat } from '@ai-sdk/react';
import { agentChatInputState } from '../states/agentChatInputState';

export const useAgentChat = () => {
  const { chat, isLoadingData } = useAgentChatContextOrThrow();

  const agentChatSelectedFiles = useRecoilValue(agentChatSelectedFilesState);

  const currentAIChatThread = useRecoilValue(currentAIChatThreadState);

  const [agentChatInput, setAgentChatInput] =
    useRecoilState(agentChatInputState);

  const scrollWrapperId = `scroll-wrapper-ai-chat-${currentAIChatThread}`;

  const { messages, status, error } = useChat({
    chat,
  });

  const isStreaming = status === 'streaming';

  const isLoading =
    isLoadingData ||
    !currentAIChatThread ||
    isStreaming ||
    agentChatSelectedFiles.length > 0;

  return {
    handleInputChange: (value: string) => setAgentChatInput(value),
    messages,
    input: agentChatInput,
    isLoading,
    scrollWrapperId,
    isStreaming,
    error,
  };
};
