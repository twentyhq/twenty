import { isUndefined } from '@sniptt/guards';

import { type HttpEgressLambdaResponse } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/http-egress-lambda-response.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

// An HTTP error carries its response body as both error and result; the invoke payload only needs it once.
export const omitResultDuplicatingError = (
  response: HttpEgressResponse,
): HttpEgressLambdaResponse => {
  const { result, ...toolOutput } = response.toolOutput;

  if (isUndefined(result) || !Object.is(result, toolOutput.error)) {
    return response;
  }

  return { ...response, toolOutput, resultIsError: true };
};
