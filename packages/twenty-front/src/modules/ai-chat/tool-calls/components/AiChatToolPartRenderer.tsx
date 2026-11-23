import { type DynamicToolUIPart, getToolName, type ToolUIPart } from 'ai';
import {
  ASK_QUESTION_TOOL_NAME,
  ASK_QUESTIONS_TOOL_NAME,
  PREVIEW_FRONT_COMPONENT_TOOL_NAME,
  PROPOSE_TOOL_CALL_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AiChatFormStatusRenderer } from '@/ai-chat/tool-calls/components/AiChatFormStatusRenderer';
import { AiChatFrontComponentToolPreview } from '@/ai-chat/tool-calls/components/AiChatFrontComponentToolPreview';
import { AiChatQuestionStatusRenderer } from '@/ai-chat/tool-calls/components/AiChatQuestionStatusRenderer';
import { AiChatToolCallApprovalStatusRenderer } from '@/ai-chat/tool-calls/components/AiChatToolCallApprovalStatusRenderer';
import { AiChatToolWidget } from '@/ai-chat/tool-calls/components/AiChatToolWidget';
import { getEffectiveToolName } from '@/ai-chat/tool-calls/utils/getEffectiveToolName';

type AiChatToolPartRendererProps = {
  toolPart: ToolUIPart | DynamicToolUIPart;
  frontComponentIdByToolName: Map<string, string>;
  isStreaming: boolean;
};

export const AiChatToolPartRenderer = ({
  toolPart,
  frontComponentIdByToolName,
  isStreaming,
}: AiChatToolPartRendererProps) => {
  const toolName = getToolName(toolPart);

  if (
    toolName === ASK_QUESTION_TOOL_NAME ||
    toolName === ASK_QUESTIONS_TOOL_NAME
  ) {
    return (
      <AiChatQuestionStatusRenderer
        toolPart={toolPart}
        isStreaming={isStreaming}
      />
    );
  }

  if (toolName === PROPOSE_TOOL_CALL_TOOL_NAME) {
    return (
      <AiChatToolCallApprovalStatusRenderer
        toolPart={toolPart}
        isStreaming={isStreaming}
      />
    );
  }

  if (toolName === REQUEST_FORM_TOOL_NAME) {
    return (
      <AiChatFormStatusRenderer toolPart={toolPart} isStreaming={isStreaming} />
    );
  }

  const effectiveToolName = getEffectiveToolName(toolPart);

  if (effectiveToolName === PREVIEW_FRONT_COMPONENT_TOOL_NAME) {
    return (
      <AiChatFrontComponentToolPreview
        toolPart={toolPart}
        isStreaming={isStreaming}
      />
    );
  }

  const frontComponentId = frontComponentIdByToolName.get(effectiveToolName);

  return isDefined(frontComponentId) ? (
    <AiChatToolWidget
      toolPart={toolPart}
      frontComponentId={frontComponentId}
      isStreaming={isStreaming}
    />
  ) : null;
};
