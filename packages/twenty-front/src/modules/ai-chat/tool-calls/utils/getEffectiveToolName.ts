import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { type ToolInput } from '@/ai/types/ToolInput';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrapToolInput';

export const getEffectiveToolName = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): string =>
  unwrapToolInput({
    input: toolPart.input as ToolInput,
    toolName: getToolName(toolPart),
  }).toolName;
