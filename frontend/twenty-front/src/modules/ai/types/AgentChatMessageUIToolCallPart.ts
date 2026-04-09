import { type NavigateAppToolOutput } from 'twenty-shared/ai';

export type AgentChatMessageUIToolCallPart = {
  type: 'tool-execute_tool';
  toolCallId: string;
  state: string;
  output: {
    toolName: string;
    result: {
      message: string;
      result: NavigateAppToolOutput;
      success: boolean;
    };
  };
};
