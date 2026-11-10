import { HTTP_EGRESS_LAMBDA_MAX_INVOKE_PAYLOAD_BYTES } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type HttpEgressLambdaResponse } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/http-egress-lambda-response.type';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';

// The response body is capped, but JSON escaping can still push the serialized result past the invoke limit.
export const enforceHttpEgressResultSize = (
  request: HttpEgressRequest,
  response: HttpEgressLambdaResponse,
): HttpEgressLambdaResponse => {
  if (
    Buffer.byteLength(JSON.stringify(response)) <=
    HTTP_EGRESS_LAMBDA_MAX_INVOKE_PAYLOAD_BYTES
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
