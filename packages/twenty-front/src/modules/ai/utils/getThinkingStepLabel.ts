import { getToolName } from 'ai';

import { type ThinkingStepPart } from '@/ai/types/ThinkingStepPart';
import { type ToolDisplayContext } from '@/ai/types/ToolDisplayContext';
import { getReasoningStepLabel } from '@/ai/utils/getReasoningStepLabel';
import { getToolDisplayMessage } from '@/ai/utils/tool-display/getToolDisplayMessage';

export const getThinkingStepLabel = ({
  part,
  isActive,
  displayContext,
}: {
  part: ThinkingStepPart;
  isActive: boolean;
  displayContext: ToolDisplayContext;
}) =>
  part.type === 'reasoning'
    ? getReasoningStepLabel({ text: part.text, isActive })
    : getToolDisplayMessage({
        input: part.input,
        toolName: getToolName(part),
        isFinished: !isActive,
        displayContext,
        output: part.output,
      });
