import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { PUBLISH_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';
import { ThinkingToolStepRow } from '@/ai/components/ThinkingToolStepRow';
import { useAgentChatPendingToolCalls } from '@/ai/hooks/useAgentChatPendingToolCalls';
import { getFrontComponentDraftId } from '@/ai/utils/getFrontComponentDraftId';
import { isThinkingStepPartActive } from '@/ai/utils/isThinkingStepPartActive';

type AiChatFrontComponentToolPreviewProps = {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
};

export const AiChatFrontComponentToolPreview = ({
  toolPart,
  isStreaming,
}: AiChatFrontComponentToolPreviewProps) => {
  const draftId = getFrontComponentDraftId(toolPart);
  const pendingToolCalls = useAgentChatPendingToolCalls();

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
