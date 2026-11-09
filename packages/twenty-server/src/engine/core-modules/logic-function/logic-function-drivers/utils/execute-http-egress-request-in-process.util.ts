import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { type HttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/types/http-egress-request.type';
import { executeHttpEgressRequest } from 'src/engine/core-modules/tool/tools/http-tool/utils/execute-http-egress-request.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const executeHttpEgressRequestInProcess = async ({
  request,
  secureHttpClientService,
}: {
  request: HttpEgressRequest;
  secureHttpClientService: SecureHttpClientService;
}): Promise<ToolOutput> => {
  const { toolOutput } = await executeHttpEgressRequest(
    request,
    secureHttpClientService.getHttpClient(undefined, request.context),
  );

  return toolOutput;
};
