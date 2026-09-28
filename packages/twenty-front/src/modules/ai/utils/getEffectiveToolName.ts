import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { type ToolInput } from '@/ai/types/ToolInput';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrap-tool-input.util';

// A call dispatched through execute_tool carries the real tool name in its
// input; presentation belongs to that tool, not to the dispatcher.
export const getEffectiveToolName = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): string =>
  unwrapToolInput({
    input: toolPart.input as ToolInput,
    toolName: getToolName(toolPart),
  }).toolName;
