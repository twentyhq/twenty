import { type DynamicToolUIPart, getToolName, type ToolUIPart } from 'ai';
import { type FrontComponentToolCall } from 'twenty-sdk/front-component';

import { type ToolInput } from '@/ai/types/ToolInput';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrapToolInput';

// execute_tool wraps the real tool, and the component belongs to the dispatched one.
export const buildFrontComponentToolCall = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): FrontComponentToolCall => {
  const { toolName, toolInput } = unwrapToolInput({
    input: toolPart.input as ToolInput,
    toolName: getToolName(toolPart),
  });

  return {
    toolCallId: toolPart.toolCallId,
    toolName,
    status: toolPart.state,
    input: toolInput as Record<string, unknown> | undefined,
    output:
      toolPart.state === 'output-available'
        ? (toolPart.output as Record<string, unknown> | undefined)
        : undefined,
    errorText:
      toolPart.state === 'output-error' ? toolPart.errorText : undefined,
  };
};
