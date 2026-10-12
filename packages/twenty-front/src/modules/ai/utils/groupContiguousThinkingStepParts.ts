import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type AssistantMessageRenderItem } from '@/ai/types/AssistantMessageRenderItem';
import { isPausingToolPart } from '@/ai/utils/isPausingToolPart';
import { isThinkingStepPart } from '@/ai/utils/isThinkingStepPart';
import { type ThinkingStepPart } from '@/ai/types/ThinkingStepPart';

export const groupContiguousThinkingStepParts = (
  parts: ExtendedUIMessagePart[],
  shouldRenderStandalone: (part: ExtendedUIMessagePart) => boolean = () =>
    false,
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

    if (
      isThinkingStepPart(part) &&
      !isPausingToolPart(part) &&
      !shouldRenderStandalone(part)
    ) {
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
