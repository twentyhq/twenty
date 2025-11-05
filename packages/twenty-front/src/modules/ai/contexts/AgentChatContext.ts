import { createContext } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { type ObjectRecord } from '../../object-record/types/ObjectRecord';

export type AgentChatContextValue = {
  messages: ExtendedUIMessage[];
  isStreaming: boolean;
  isLoading: boolean;
  error?: Error;

  input: string;
  handleInputChange: (value: string) => void;

  handleSendMessage: (records?: ObjectRecord[]) => Promise<void>;

  scrollWrapperId: string;
  handleRetry: () => void;
};

export const AgentChatContext = createContext<AgentChatContextValue | null>(
  null,
);
