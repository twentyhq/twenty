import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';
import { ThinkingToolStepRow } from '@/ai/components/ThinkingToolStepRow';
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

  return isDefined(draftId) ? (
    <AiChatFrontComponentPreview key={draftId} draftId={draftId} />
  ) : (
    <ThinkingToolStepRow
      part={toolPart}
      isActive={isThinkingStepPartActive(toolPart, isStreaming)}
    />
  );
};
