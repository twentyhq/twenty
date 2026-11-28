import { isNonEmptyString, isObject } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';

import { hasToolOutputFailed } from '@/ai/utils/tool-display/hasToolOutputFailed';

type ToolPartError =
  | { hasError: false; errorText?: undefined }
  | { hasError: true; errorText: string | undefined };

const getOutputErrorText = (output: unknown): string | undefined => {
  if (!isObject(output)) {
    return undefined;
  }

  if ('error' in output && isNonEmptyString(output.error)) {
    return output.error;
  }

  if ('message' in output && isNonEmptyString(output.message)) {
    return output.message;
  }

  return undefined;
};

export const getToolPartError = (
  part: Pick<ToolUIPart | DynamicToolUIPart, 'state' | 'output' | 'errorText'>,
): ToolPartError => {
  if (part.state === 'output-error') {
    return { hasError: true, errorText: part.errorText };
  }

  if (part.state === 'output-available' && hasToolOutputFailed(part.output)) {
    return { hasError: true, errorText: getOutputErrorText(part.output) };
  }

  return { hasError: false };
};
