import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type ThinkingStepPart } from '@/ai/types/ThinkingStepPart';

export const isThinkingStepPart = (
  part: ExtendedUIMessagePart,
): part is ThinkingStepPart => {
  if (part.type === 'reasoning') {
    return true;
  }

  return isToolUIPart(part);
};
