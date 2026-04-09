import { type ReasoningUIPart } from 'ai';

import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';

export const getActiveReasoningContent = (
  parts: ThinkingStepPart[],
): string | null => {
  const activeReasoningPart = parts.find(
    (part): part is ReasoningUIPart =>
      part.type === 'reasoning' && part.state === 'streaming',
  );

  return activeReasoningPart?.text ?? null;
};
