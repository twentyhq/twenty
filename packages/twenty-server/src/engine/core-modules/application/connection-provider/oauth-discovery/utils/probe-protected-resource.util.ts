import { extractWWWAuthenticateParams } from '@modelcontextprotocol/sdk/client/auth.js';
import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

export type ProtectedResourceProbe = {
  isSignInRequired: boolean;
  resourceMetadataUrl?: URL;
  scope?: string;
};

export const probeProtectedResource = async ({
  resourceUrl,
  fetchFunction,
}: {
  resourceUrl: string;
  fetchFunction: FetchLike;
}): Promise<ProtectedResourceProbe> => {
  const response = await fetchFunction(resourceUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 0, method: 'ping' }),
  });

  await response.body?.cancel().catch(() => undefined);

  if (response.status !== 401) {
    return { isSignInRequired: false };
  }

  return {
    isSignInRequired: true,
    ...extractWWWAuthenticateParams(response),
  };
};
