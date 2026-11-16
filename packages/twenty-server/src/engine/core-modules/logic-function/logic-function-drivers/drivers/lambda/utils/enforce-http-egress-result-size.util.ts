import { HTTP_EGRESS_LAMBDA_MAX_INVOKE_PAYLOAD_BYTES } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/constants/lambda-driver.constant';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';

// The response body is capped, but JSON escaping can still push the serialized result past the invoke limit.
export const enforceHttpEgressResultSize = (
  response: HttpEgressResponse,
): HttpEgressResponse => {
  if (
    Buffer.byteLength(JSON.stringify(response)) <=
    HTTP_EGRESS_LAMBDA_MAX_INVOKE_PAYLOAD_BYTES
  ) {
    return response;
  }

  return {
    status: response.status,
    errorMessage: 'The response is too large to return',
    outcomeDetails: {
      ...response.outcomeDetails,
      outcome: 'other-error',
      errorCode: 'RESULT_TOO_LARGE',
    },
  };
};
