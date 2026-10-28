import { UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS } from 'src/unipile/constants/unipile-hosted-auth-link-ttl-milliseconds.constant';
import { type UnipileProvider } from 'src/unipile/types/unipile-provider.type';
import { callUnipileApi } from 'src/unipile/utils/call-unipile-api.util';
import { splitCallbackUrlState } from 'src/unipile/utils/split-callback-url-state.util';

export const createUnipileHostedAuthLink = async ({
  provider,
  callbackUrl,
}: {
  provider: UnipileProvider;
  callbackUrl: string;
}): Promise<string> => {
  const { redirectUri, state } = splitCallbackUrlState(callbackUrl);

  const { link } = await callUnipileApi<{ link: string }>({
    method: 'POST',
    path: '/auth/link',
    body: {
      providers: [provider],
      redirect_uri: redirectUri,
      state,
      expires_on: new Date(
        Date.now() + UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS,
      ).toISOString(),
    },
  });

  return link;
};
