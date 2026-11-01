import { isNonEmptyString, isString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isPlainObject } from 'twenty-shared/utils';

import { AiChatFrontComponentPreview } from '@/ai/components/AiChatFrontComponentPreview';
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
  const output =
    toolPart.state === 'output-available' ? toolPart.output : undefined;
  const draftId =
    isPlainObject(output) &&
    output.success === true &&
    isPlainObject(output.result) &&
    isString(output.result.draftId)
      ? output.result.draftId
      : undefined;

  return isNonEmptyString(draftId) ? (
    <AiChatFrontComponentPreview key={draftId} draftId={draftId} />
  ) : (
    <ThinkingToolStepRow
      part={toolPart}
      isActive={isThinkingStepPartActive(toolPart, isStreaming)}
    />
  );
};
