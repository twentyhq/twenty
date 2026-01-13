import { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { v4 } from 'uuid';

import { AGENT_CONFIGS } from '../constants/agents';
import {
  activeAgentState,
  chatErrorState,
  chatLoadingState,
  chatMessagesState,
  linkedEntityState,
} from '../states/chatState';
import { AgentType, ChatMessage } from '../types/chat.types';

interface SendMessageOptions {
  linkedEntity?: {
    type: 'company' | 'contact' | 'document';
    id: string;
    name: string;
  };
}

export const useAIChat = () => {
  const [messages, setMessages] = useRecoilState(chatMessagesState);
  const [loading, setLoading] = useRecoilState(chatLoadingState);
  const [error, setError] = useRecoilState(chatErrorState);
  const [activeAgent, setActiveAgent] = useRecoilState(activeAgentState);
  const linkedEntity = useRecoilValue(linkedEntityState);
  const setLinkedEntity = useSetRecoilState(linkedEntityState);

  const sendMessage = useCallback(
    async (content: string, options?: SendMessageOptions) => {
      // Add user message
      const userMessage: ChatMessage = {
        id: v4(),
        role: 'user',
        content,
        timestamp: new Date(),
        metadata: options?.linkedEntity
          ? { linkedEntity: options.linkedEntity }
          : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);
      setError(null);

      try {
        // Build context for the agent
        const context = {
          messages: [...messages, userMessage],
          activeAgent,
          linkedEntity: options?.linkedEntity || linkedEntity,
          agentConfig: AGENT_CONFIGS[activeAgent],
        };

        // Call backend API
        const response = await fetch('/api/ai-chat/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            context,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to send message');
        }

        const data = await response.json();

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: v4(),
          role: 'assistant',
          content: data.content,
          agent: data.agent || activeAgent,
          timestamp: new Date(),
          metadata: {
            toolCalls: data.toolCalls,
          },
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Update active agent if switched
        if (data.agent && data.agent !== activeAgent) {
          setActiveAgent(data.agent);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        // Add error message to chat
        const errorChatMessage: ChatMessage = {
          id: v4(),
          role: 'system',
          content: `Error: ${errorMessage}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorChatMessage]);
      } finally {
        setLoading(false);
      }
    },
    [
      messages,
      activeAgent,
      linkedEntity,
      setMessages,
      setLoading,
      setError,
      setActiveAgent,
    ],
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    setActiveAgent('orchestrator');
    setLinkedEntity(null);
  }, [setMessages, setError, setActiveAgent, setLinkedEntity]);

  const switchAgent = useCallback(
    (agent: AgentType) => {
      setActiveAgent(agent);

      // Add system message about agent switch
      const systemMessage: ChatMessage = {
        id: v4(),
        role: 'system',
        content: `Switched to ${AGENT_CONFIGS[agent].name}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, systemMessage]);
    },
    [setActiveAgent, setMessages],
  );

  return {
    messages,
    loading,
    error,
    activeAgent,
    linkedEntity,
    sendMessage,
    clearChat,
    switchAgent,
    setLinkedEntity,
  };
};
