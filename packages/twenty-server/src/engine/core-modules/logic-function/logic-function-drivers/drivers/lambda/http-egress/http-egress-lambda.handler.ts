import { type HttpEgressLambdaResponse } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/http-egress-lambda-response.type';
import { enforceHttpEgressResultSize } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/enforce-http-egress-result-size.util';
import { omitResultDuplicatingError } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/omit-result-duplicating-error.util';
import { createSsrfSafeAxiosClient } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-axios-client.util';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { executeHttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/utils/execute-http-egress-request.util';

export const handler = async (
  request: HttpEgressRequest,
): Promise<HttpEgressLambdaResponse> => {
  // Loopback here is the Lambda Runtime API, which serves other workspaces' invocations: no internal host is allowed.
  const httpClient = createSsrfSafeAxiosClient({ allowedInternalHosts: [] });

  return enforceHttpEgressResultSize(
    request,
    omitResultDuplicatingError(
      await executeHttpEgressRequest(request, httpClient),
    ),
  );
};
