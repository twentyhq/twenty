import { type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { AiChatToolFrontComponent } from '@/ai-chat/tool-calls/components/AiChatToolFrontComponent';
import { ThinkingToolStepRow } from '@/ai-chat/thinking-steps/components/ThinkingToolStepRow';
import { isThinkingStepPartActive } from '@/ai-chat/thinking-steps/utils/isThinkingStepPartActive';
import { unwrapToolPartInput } from '@/ai/utils/tool-display/unwrapToolPartInput';

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
  const { toolName, toolInput } = unwrapToolPartInput(toolPart);

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
