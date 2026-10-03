import { type AgentChatMessageUIToolCallPart } from '@/ai/types/AgentChatMessageUIToolCallPart';
import { getEffectiveToolName } from '@/ai/utils/getEffectiveToolName';
import { type DynamicToolUIPart, isToolUIPart, type ToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const extractUIToolCallParts = (
  messageParts: ExtendedUIMessagePart[],
): AgentChatMessageUIToolCallPart[] =>
  messageParts.filter(
    (part): part is ToolUIPart | DynamicToolUIPart =>
      isToolUIPart(part) && getEffectiveToolName(part) === 'navigate_app',
  ) as AgentChatMessageUIToolCallPart[];
