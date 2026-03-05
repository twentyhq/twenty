import { type AgentChatMessageUIToolCallPart } from '@/ai/types/AgentChatMessageUIToolCallPart';
import { type UIMessagePart } from 'ai';

export const extractUIToolCallParts = (
  messageParts: UIMessagePart<any, any>[],
): AgentChatMessageUIToolCallPart[] => {
  const uiToolCallParts = messageParts.filter(
    (probablePart) =>
      probablePart.type === 'tool-execute_tool' &&
      probablePart.input?.toolName === 'navigate_app',
  ) as unknown as AgentChatMessageUIToolCallPart[];

  return uiToolCallParts;
};
