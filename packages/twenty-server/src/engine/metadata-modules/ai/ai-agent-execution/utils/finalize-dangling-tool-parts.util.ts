import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

const INTERRUPTED_TOOL_ERROR_TEXT = 'Tool execution was interrupted.';

export const finalizeDanglingToolParts = (
  parts: ExtendedUIMessagePart[],
): ExtendedUIMessagePart[] =>
  parts
    .filter((part) => !(isToolUIPart(part) && part.state === 'input-streaming'))
    .map((part) =>
      isToolUIPart(part) && part.state === 'input-available'
        ? ({
            ...part,
            state: 'output-error',
            errorText: INTERRUPTED_TOOL_ERROR_TEXT,
          } as ExtendedUIMessagePart)
        : part,
    );
