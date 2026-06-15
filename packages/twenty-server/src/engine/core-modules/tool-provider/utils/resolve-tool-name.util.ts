import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  EXECUTE_TOOL_TOOL_NAME,
  type ExecuteToolInput,
} from 'src/engine/core-modules/tool-provider/tools';

const hasExecuteToolName = (
  input: unknown,
): input is Pick<ExecuteToolInput, 'toolName'> =>
  isDefined(input) &&
  typeof input === 'object' &&
  'toolName' in input &&
  isNonEmptyString(input.toolName);

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
