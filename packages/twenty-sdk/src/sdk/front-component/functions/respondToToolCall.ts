import { type ToolCallApprovalResponse } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import {
  frontComponentHostCommunicationApi,
  type RespondToToolCallFunction,
} from '../globals/frontComponentHostCommunicationApi';

export const respondToToolCall: RespondToToolCallFunction = (
  response: ToolCallApprovalResponse,
) => {
  const respondToToolCallFunction =
    frontComponentHostCommunicationApi.respondToToolCall;

  if (!isDefined(respondToToolCallFunction)) {
    throw new Error('respondToToolCallFunction is not set');
  }

  return respondToToolCallFunction(response);
};
