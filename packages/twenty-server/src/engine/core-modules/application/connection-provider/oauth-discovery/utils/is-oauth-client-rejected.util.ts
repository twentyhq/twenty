import { type FetchLike } from '@modelcontextprotocol/sdk/shared/transport.js';

// Without a browser session the server answers with its login page, unless it does not know the client.
export const isOAuthClientRejected = async ({
  authorizationUrl,
  fetchFn,
}: {
  authorizationUrl: URL;
  fetchFn: FetchLike;
}): Promise<boolean> => {
  try {
    const response = await fetchFn(authorizationUrl, {
      method: 'GET',
      redirect: 'manual',
    });

    await response.body?.cancel().catch(() => undefined);

    return response.status === 400 || response.status === 401;
  } catch {
    return false;
  }
};
