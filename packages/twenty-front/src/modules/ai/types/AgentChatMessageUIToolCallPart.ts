import { type NavigateAppToolOutput } from 'twenty-shared/ai';

export type AgentChatMessageUIToolCallPart = {
  toolCallId: string;
  output?: {
    success: boolean;
    message: string;
    error?: string;
    result?: NavigateAppToolOutput;
  };
};
