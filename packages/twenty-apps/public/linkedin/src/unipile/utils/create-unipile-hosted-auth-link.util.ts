import { UnipileHostedAuth } from '@unipile/sdk';

import { UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS } from 'src/unipile/constants/unipile-hosted-auth-link-ttl-milliseconds.constant';
import { type UnipileProvider } from 'src/unipile/types/unipile-provider.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';
import { splitCallbackUrlStateOrThrow } from 'src/unipile/utils/split-callback-url-state-or-throw.util';

export const createUnipileHostedAuthLink = async ({
  provider,
  callbackUrl,
}: {
  provider: Exclude<UnipileProvider, 'mock'>;
  callbackUrl: string;
}): Promise<string> => {
  const { redirectUri, state } = splitCallbackUrlStateOrThrow(callbackUrl);

  const { data } = await new UnipileHostedAuth().createAuthLink({
    ...getUnipileRequestOptions(),
    body: {
      providers: [provider],
      redirect_uri: redirectUri,
      state,
      expires_on: new Date(
        Date.now() + UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS,
      ).toISOString(),
    },
  });

  return data.link;
};
