import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AssistantMessageRenderItem } from '@/ai/utils/assistantMessageRenderItem';
import { isAskQuestionsToolPart } from '@/ai/utils/isAskQuestionsToolPart';
import { isThinkingStepPart } from '@/ai/utils/isThinkingStepPart';
import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';

export const groupContiguousThinkingStepParts = (
  parts: ExtendedUIMessagePart[],
): AssistantMessageRenderItem[] => {
  const renderItems: AssistantMessageRenderItem[] = [];
  let currentThinkingParts: ThinkingStepPart[] = [];

  const flushThinkingParts = () => {
    if (currentThinkingParts.length > 0) {
      renderItems.push({
        type: 'thinking-steps',
        parts: currentThinkingParts,
      });
      currentThinkingParts = [];
    }
  };

  for (const part of parts) {
    if (part.type === 'step-start') {
      continue;
    }

    if (isThinkingStepPart(part) && !isAskQuestionsToolPart(part)) {
      currentThinkingParts.push(part);
      continue;
    }

    flushThinkingParts();

    renderItems.push({
      type: 'part',
      part,
    });
  }

  flushThinkingParts();

  return renderItems;
};
