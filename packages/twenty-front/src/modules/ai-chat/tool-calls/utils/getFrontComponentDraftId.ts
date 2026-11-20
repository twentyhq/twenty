import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { isPlainObject } from 'twenty-shared/utils';

export const getFrontComponentDraftId = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): string | undefined => {
  if (toolPart.state !== 'output-available') {
    return undefined;
  }

  const output = toolPart.output;

  if (
    !isPlainObject(output) ||
    output.success !== true ||
    !isPlainObject(output.result)
  ) {
    return undefined;
  }

  if (!isNonEmptyString(output.result.draftId)) {
    return undefined;
  }

  return output.result.draftId;
};
