import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { PUBLISH_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AiChatFrontComponentPreview } from '@/ai-chat/tool-calls/components/AiChatFrontComponentPreview';
import { ThinkingToolStepRow } from '@/ai-chat/thinking-steps/components/ThinkingToolStepRow';
import { useAiChatPendingToolCalls } from '@/ai-chat/tool-calls/hooks/useAiChatPendingToolCalls';
import { getFrontComponentDraftId } from '@/ai-chat/tool-calls/utils/getFrontComponentDraftId';
import { isThinkingStepPartActive } from '@/ai-chat/thinking-steps/utils/isThinkingStepPartActive';

type AiChatFrontComponentToolPreviewProps = {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
};

export const AiChatFrontComponentToolPreview = ({
  toolPart,
  isStreaming,
}: AiChatFrontComponentToolPreviewProps) => {
  const draftId = getFrontComponentDraftId(toolPart);
  const pendingToolCalls = useAiChatPendingToolCalls();

  if (
    isDefined(draftId) &&
    pendingToolCalls.some(
      (pendingToolCall) =>
        pendingToolCall.kind === 'toolCallApproval' &&
        pendingToolCall.proposal.toolName ===
          PUBLISH_FRONT_COMPONENT_TOOL_NAME &&
        pendingToolCall.proposal.arguments.draftId === draftId,
    )
  ) {
    return null;
  }

  return isDefined(draftId) ? (
    <AiChatFrontComponentPreview key={draftId} draftId={draftId} />
  ) : (
    <ThinkingToolStepRow
      part={toolPart}
      isActive={isThinkingStepPartActive(toolPart, isStreaming)}
    />
  );
};
