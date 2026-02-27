import { type AgentChatMessageUIToolCallPart } from '@/ai/types/AgentChatMessageUIToolCallPart';

export const isUIToolCallPart = (
  probablePart: any,
): probablePart is AgentChatMessageUIToolCallPart => {
  return (
    probablePart.type === 'tool-execute_tool' &&
    probablePart.input?.toolName === 'navigate_app'
  );
};
