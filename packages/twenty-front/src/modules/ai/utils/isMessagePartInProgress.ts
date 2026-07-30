import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

export const isMessagePartInProgress = (
  part: ExtendedUIMessagePart,
): boolean => {
  if (part.type === 'text' || part.type === 'reasoning') {
    return part.state === 'streaming';
  }

  if (part.type === 'data-routing-status') {
    return part.data.state === 'loading';
  }

  if (part.type === 'data-code-execution') {
    return part.data.state === 'pending' || part.data.state === 'running';
  }

  return (
    isToolUIPart(part) && !isDefined(part.output) && !isDefined(part.errorText)
  );
};
