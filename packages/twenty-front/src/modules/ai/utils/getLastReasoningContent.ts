import { type ReasoningUIPart } from 'ai';

import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';

export const getLastReasoningContent = (
  parts: ThinkingStepPart[],
): string | null => {
  const reasoningParts = parts.filter(
    (part): part is ReasoningUIPart => part.type === 'reasoning',
  );

  return reasoningParts.at(-1)?.text ?? null;
};
