import { HTTP_EGRESS_LAMBDA_MAX_RESULT_BYTES } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

// The response body is capped, but JSON escaping can still push the serialized result past the invoke limit.
export const enforceHttpEgressResultSize = (
  request: HttpEgressRequest,
  response: HttpEgressResponse,
): HttpEgressResponse => {
  if (
    Buffer.byteLength(JSON.stringify(response)) <=
    HTTP_EGRESS_LAMBDA_MAX_RESULT_BYTES
  ) {
    return response;
  }

  return {
    toolOutput: {
      success: false,
      message: `HTTP ${request.input.method} request to ${request.input.url} failed`,
      error: 'The response is too large to return',
      status: response.toolOutput.status,
    },
    outcomeDetails: {
      ...response.outcomeDetails,
      outcome: 'other-error',
      errorCode: 'RESULT_TOO_LARGE',
    },
  };
};
