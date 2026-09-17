import { isDefined } from 'twenty-shared/utils';

import {
  type CallToolFunction,
  frontComponentHostCommunicationApi,
} from '../globals/frontComponentHostCommunicationApi';

export const callTool: CallToolFunction = (toolName, input) => {
  const callToolFunction = frontComponentHostCommunicationApi.callTool;

  if (!isDefined(callToolFunction)) {
    throw new Error('callToolFunction is not set');
  }

  return callToolFunction(toolName, input);
};
