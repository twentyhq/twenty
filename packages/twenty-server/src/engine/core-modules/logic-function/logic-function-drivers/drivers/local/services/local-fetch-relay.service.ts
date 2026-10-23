import { type LocalFetchRelayHandler } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-fetch-relay.type';
import { getLocalFetchRelayServerOrigin } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/get-local-fetch-relay-server-origin.util';
import { performLocalFetchRelayRequest } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/utils/perform-local-fetch-relay-request.util';
import { OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES } from 'src/engine/core-modules/secure-http-client/constants/outbound-http-default-max-payload-size-bytes.constant';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

export class LocalFetchRelayService {
  constructor(
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  createHandler({
    workspaceId,
    env,
    timeoutMs,
  }: {
    workspaceId: string;
    env: Record<string, string>;
    timeoutMs: number;
  }): LocalFetchRelayHandler {
    const serverOrigin = getLocalFetchRelayServerOrigin(env);

    const outboundHttpClient = this.secureHttpClientService.getHttpClient(
      undefined,
      { workspaceId, source: 'logic-function' },
    );

    // The server often sits on a private address; no redirects so a route handler cannot bounce to an internal host.
    const serverHttpClient = this.secureHttpClientService.getInternalHttpClient(
      {
        maxRedirects: 0,
        maxContentLength: OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES,
        maxBodyLength: OUTBOUND_HTTP_DEFAULT_MAX_PAYLOAD_SIZE_BYTES,
      },
    );

    return ({ request, signal }) =>
      performLocalFetchRelayRequest({
        request,
        signal,
        timeoutMs,
        httpClient:
          new URL(request.url).origin === serverOrigin
            ? serverHttpClient
            : outboundHttpClient,
      });
  }
}
