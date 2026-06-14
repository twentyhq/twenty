import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { isCodeInterpreterToolPart } from '@/ai/utils/isCodeInterpreterToolPart';
import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';

export const isThinkingStepPart = (
  part: ExtendedUIMessagePart,
): part is ThinkingStepPart => {
  if (part.type === 'reasoning') {
    return true;
  }

  return isToolUIPart(part) && !isCodeInterpreterToolPart(part);
};
