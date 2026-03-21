import { type AgentChatMessageUIToolCallPart } from '@/ai/types/AgentChatMessageUIToolCallPart';
import { type UIDataTypes, type UIMessagePart, type UITools } from 'ai';

const isNavigateAppToolCallPart = (
  part: UIMessagePart<UIDataTypes, UITools>,
): boolean =>
  part.type === 'tool-execute_tool' &&
  typeof part.input === 'object' &&
  part.input !== null &&
  'toolName' in part.input &&
  (part.input as { toolName?: string }).toolName === 'navigate_app';

// Parts are runtime-validated by isNavigateAppToolCallPart above;
// the AI SDK's UIMessagePart union is structurally incompatible with
// our narrower AgentChatMessageUIToolCallPart shape.
export const extractUIToolCallParts = (
  messageParts: UIMessagePart<UIDataTypes, UITools>[],
): AgentChatMessageUIToolCallPart[] =>
  messageParts.filter(isNavigateAppToolCallPart) as unknown as AgentChatMessageUIToolCallPart[];
