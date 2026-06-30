import { isNonEmptyString, isObject } from '@sniptt/guards';

import {
  EXECUTE_TOOL_TOOL_NAME,
  type ExecuteToolInput,
} from 'src/engine/core-modules/tool-provider/tools';

const hasExecuteToolName = (
  input: unknown,
): input is Pick<ExecuteToolInput, 'toolName'> =>
  isObject(input) && 'toolName' in input && isNonEmptyString(input.toolName);

export const resolveToolName = (part: {
  toolName: string;
  input?: unknown;
}): string => {
  if (part.toolName !== EXECUTE_TOOL_TOOL_NAME) {
    return part.toolName;
  }

  return hasExecuteToolName(part.input)
    ? part.input.toolName
    : `${EXECUTE_TOOL_TOOL_NAME}:unknown`;
};
