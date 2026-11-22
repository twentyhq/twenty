import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { type ToolInput } from '@/ai/types/ToolInput';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrapToolInput';

export const unwrapToolPartInput = (part: ToolUIPart | DynamicToolUIPart) =>
  unwrapToolInput({
    input: part.input as ToolInput,
    toolName: getToolName(part),
  });
