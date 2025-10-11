import { type AIChatObjectMetadataAndRecordContext } from '@/ai/states/agentChatContextState';
import { type UIMessageWithMetadata } from '@/ai/types/UIMessageWithMetadata';
import { createContext } from 'react';
import { type ObjectRecord } from '../../object-record/types/ObjectRecord';

export type AgentChatContextValue = {
  messages: UIMessageWithMetadata[];
  isStreaming: boolean;
  isLoading: boolean;
  error?: Error;

  input: string;
  handleInputChange: (value: string) => void;

  handleSendMessage: (records?: ObjectRecord[]) => Promise<void>;
  handleSetContext: (
    items: Array<AIChatObjectMetadataAndRecordContext>,
  ) => Promise<void>;

  scrollWrapperId: string;
  context: Array<AIChatObjectMetadataAndRecordContext>;
};

export const AgentChatContext = createContext<AgentChatContextValue | null>(
  null,
);
