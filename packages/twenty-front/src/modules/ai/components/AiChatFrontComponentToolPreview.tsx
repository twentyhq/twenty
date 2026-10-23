import { isString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isPlainObject } from 'twenty-shared/utils';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';
import { useAgentChatPendingToolCalls } from '@/ai/hooks/useAgentChatPendingToolCalls';
import { ThinkingToolStepRow } from '@/ai/components/ThinkingToolStepRow';
import { isThinkingStepPartActive } from '@/ai/utils/isThinkingStepPartActive';

type AiChatFrontComponentToolPreviewProps = {
  toolPart: ToolUIPart | DynamicToolUIPart;
  isStreaming: boolean;
};

export const AiChatFrontComponentToolPreview = ({
  toolPart,
  isStreaming,
}: AiChatFrontComponentToolPreviewProps) => {
  const pendingToolCalls = useAgentChatPendingToolCalls();
  const output =
    toolPart.state === 'output-available' ? toolPart.output : undefined;
  const draftId =
    isPlainObject(output) &&
    output.success === true &&
    isPlainObject(output.result) &&
    isString(output.result.draftId)
      ? output.result.draftId
      : undefined;

  if (
    draftId &&
    pendingToolCalls.some(
      (pendingToolCall) =>
        pendingToolCall.kind === 'toolCallApproval' &&
        pendingToolCall.proposal.template === 'frontComponent' &&
        pendingToolCall.proposal.arguments.draftId === draftId,
    )
  ) {
    return null;
  }

  return draftId ? (
    <AiChatFrontComponentPreview key={draftId} draftId={draftId} />
  ) : (
    <ThinkingToolStepRow
      part={toolPart}
      isActive={isThinkingStepPartActive(toolPart, isStreaming)}
    />
  );
};
