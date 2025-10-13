import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';
import { type Chat } from '@ai-sdk/react';
import { createContext } from 'react';

export type AgentChatContextValue = {
  chat: Chat<UIMessageWithMetadata>;
  isLoadingData: boolean;
};

export const AgentChatContext = createContext<AgentChatContextValue | null>(
  null,
);
