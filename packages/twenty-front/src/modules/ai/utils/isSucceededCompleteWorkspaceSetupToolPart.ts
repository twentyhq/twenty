import { isCompleteWorkspaceSetupToolPart } from '@/ai/utils/isCompleteWorkspaceSetupToolPart';
import { type ToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

export const isSucceededCompleteWorkspaceSetupToolPart = (
  part: ExtendedUIMessagePart,
): part is ToolUIPart => {
  if (!isCompleteWorkspaceSetupToolPart(part)) {
    return false;
  }

  const output: unknown = part.output;

  return (
    typeof output === 'object' &&
    output !== null &&
    'success' in output &&
    output.success === true
  );
};
