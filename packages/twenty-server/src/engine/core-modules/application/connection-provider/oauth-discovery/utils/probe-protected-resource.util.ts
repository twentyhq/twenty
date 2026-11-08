import { extractWWWAuthenticateParams } from '@modelcontextprotocol/sdk/client/auth.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

// An MCP ping, since MCP servers only answer POST; a protected resource answers 401 to any unauthenticated call.
// An unreachable resource counts as open: discovery still runs from well-known URLs, and tool sync probes again.
export const probeProtectedResource = async ({
  resourceUrl,
  fetchFn,
}: {
  resourceUrl: string;
  fetchFn: FetchLike;
}): Promise<{
  requiresAuthorization: boolean;
  resourceMetadataUrl?: URL;
  scope?: string;
}> => {
  try {
    const response = await fetchFn(resourceUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json, text/event-stream',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'ping' }),
    });

    await response.body?.cancel().catch(() => undefined);

    return response.status === 401
      ? {
          requiresAuthorization: true,
          ...extractWWWAuthenticateParams(response),
        }
      : { requiresAuthorization: false };
  } catch {
    return { requiresAuthorization: false };
  }
};
