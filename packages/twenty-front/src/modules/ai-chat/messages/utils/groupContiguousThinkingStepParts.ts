import {
  type ExtendedUIMessagePart,
  isPausingToolPart,
} from 'twenty-shared/ai';

import { type AiChatMessageRenderItem } from '@/ai-chat/messages/types/AiChatMessageRenderItem';

import { isThinkingStepPart } from '@/ai-chat/thinking-steps/utils/isThinkingStepPart';
import { type ThinkingStepPart } from '@/ai-chat/thinking-steps/types/ThinkingStepPart';

export const groupContiguousThinkingStepParts = (
  parts: ExtendedUIMessagePart[],
  shouldRenderStandalone: (part: ExtendedUIMessagePart) => boolean = () =>
    false,
): AiChatMessageRenderItem[] => {
  const renderItems: AiChatMessageRenderItem[] = [];
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
