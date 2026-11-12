import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

import { type SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';

const OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS = 15_000;

export const buildOAuthDiscoveryFetch = ({
  secureHttpClientService,
  workspaceId,
}: {
  secureHttpClientService: SecureHttpClientService;
  workspaceId: string;
}): FetchLike =>
  secureHttpClientService.createFetchLike({
    context: { workspaceId, source: 'connection-provider' },
    timeoutMs: OAUTH_DISCOVERY_REQUEST_TIMEOUT_MS,
  });
