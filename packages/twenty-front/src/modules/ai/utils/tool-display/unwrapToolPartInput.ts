import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { unwrapToolInput } from '@/ai/utils/tool-display/unwrapToolInput';

export const unwrapToolPartInput = (part: ToolUIPart | DynamicToolUIPart) =>
  unwrapToolInput({
    input: part.input,
    toolName: getToolName(part),
  });
