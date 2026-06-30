import { isDefined } from 'twenty-shared/utils';

import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';

export const isThinkingStepPartActive = (
  part: ThinkingStepPart,
  isLastMessageStreaming: boolean,
): boolean => {
  if (part.type === 'reasoning') {
    return part.state === 'streaming';
  }

  return (
    isLastMessageStreaming &&
    !isDefined(part.output) &&
    !isDefined(part.errorText)
  );
};
