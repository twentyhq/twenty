import { type DynamicToolUIPart, getToolName, type ToolUIPart } from 'ai';

import { AiChatToolFrontComponent } from '@/ai/components/AiChatToolFrontComponent';
import { ThinkingToolStepRow } from '@/ai/components/ThinkingToolStepRow';
import { type ToolInput } from '@/ai/types/ToolInput';
import { isThinkingStepPartActive } from '@/ai/utils/isThinkingStepPartActive';
import { unwrapToolInput } from '@/ai/utils/tool-display/unwrapToolInput';

type AiChatToolWidgetProps = {
  toolPart: ToolUIPart | DynamicToolUIPart;
  frontComponentId: string;
  isStreaming: boolean;
};

export const AiChatToolWidget = ({
  toolPart,
  frontComponentId,
  isStreaming,
}: AiChatToolWidgetProps) => {
  // execute_tool wraps the real tool, and the widget belongs to the dispatched one.
  const { toolName, toolInput } = unwrapToolInput({
    input: toolPart.input as ToolInput,
    toolName: getToolName(toolPart),
  });

  const toolCall = {
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

  return (
    <AiChatToolFrontComponent
      frontComponentId={frontComponentId}
      toolCall={toolCall}
      unavailableFallback={
        <ThinkingToolStepRow
          part={toolPart}
          isActive={isThinkingStepPartActive(toolPart, isStreaming)}
        />
      }
    />
  );
};
