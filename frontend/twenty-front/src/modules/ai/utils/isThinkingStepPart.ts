import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';

export const isThinkingStepPart = (
  part: ExtendedUIMessagePart,
): part is ThinkingStepPart => {
  if (part.type === 'reasoning') {
    return true;
  }

  return isToolUIPart(part) && part.type !== 'tool-code_interpreter';
};
