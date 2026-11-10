import { buildAxiosFetch } from '@lifeomic/axios-fetch';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

import { type OutboundRequestContext } from 'src/engine/core-modules/secure-http-client/outbound-request-context.type';
import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

// The MCP SDK reads SSE from a WHATWG Response, which the axios client yields whatever globalThis.fetch is.
export const buildSecureFetchLike = ({
  secureHttpClientService,
  context,
  timeoutMs,
}: {
  secureHttpClientService: SecureHttpClientService;
  context: OutboundRequestContext;
  timeoutMs: number;
}): FetchLike => {
  const axiosFetch = buildAxiosFetch(
    secureHttpClientService.getHttpClient({ timeout: timeoutMs }, context),
    (config, _input, init) =>
      init?.redirect === 'manual' ? { ...config, maxRedirects: 0 } : config,
  );

  return (url, init) => axiosFetch(url.toString(), init);
};
