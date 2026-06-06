import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

const INTERRUPTED_TOOL_ERROR_TEXT = 'Tool execution was interrupted.';

export const finalizeDanglingToolParts = (
  parts: ExtendedUIMessagePart[],
): ExtendedUIMessagePart[] =>
  parts.map((part) => {
    if (!isToolUIPart(part) || part.state !== 'input-available') {
      return part;
    }

    return {
      ...part,
      state: 'output-error',
      errorText: INTERRUPTED_TOOL_ERROR_TEXT,
    } as ExtendedUIMessagePart;
  });
