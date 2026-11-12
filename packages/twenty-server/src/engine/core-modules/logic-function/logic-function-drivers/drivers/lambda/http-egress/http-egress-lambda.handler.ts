import { enforceHttpEgressResultSize } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/enforce-http-egress-result-size.util';
import { createSsrfSafeAxiosClient } from 'src/engine/core-modules/secure-http-client/utils/create-ssrf-safe-axios-client.util';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { type HttpEgressResponse } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-response.type';
import { executeHttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/utils/execute-http-egress-request.util';

export const handler = async (
  request: HttpEgressRequest,
): Promise<HttpEgressResponse> => {
  // Loopback here is the Lambda Runtime API, which serves other workspaces' invocations: no internal host is allowed.
  const httpClient = createSsrfSafeAxiosClient({ allowedInternalHosts: [] });

  return enforceHttpEgressResultSize(
    await executeHttpEgressRequest(request, httpClient),
  );
};
