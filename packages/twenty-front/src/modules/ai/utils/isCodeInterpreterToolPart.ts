import { isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const isCodeInterpreterToolPart = (
  part: ExtendedUIMessagePart,
): boolean => {
  if (!isToolUIPart(part)) {
    return false;
  }

  if (part.type === 'tool-code_interpreter') {
    return true;
  }

  if (part.type === 'tool-execute_tool') {
    const input = part.input as Record<string, unknown> | null | undefined;

    return input?.toolName === 'code_interpreter';
  }

  return false;
};
