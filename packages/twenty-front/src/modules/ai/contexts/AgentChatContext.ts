import { type Chat } from '@ai-sdk/react';
import { createContext } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

export type AgentChatContextValue = {
  chat: Chat<ExtendedUIMessage>;
  isLoadingData: boolean;
};

export const AgentChatContext = createContext<AgentChatContextValue | null>(
  null,
);
