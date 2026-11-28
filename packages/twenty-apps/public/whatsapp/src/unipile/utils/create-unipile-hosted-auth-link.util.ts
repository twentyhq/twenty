import { type CreateAuthLinkData, UnipileHostedAuth } from '@unipile/sdk';

import { UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS } from 'src/unipile/constants/unipile-hosted-auth-link-ttl-milliseconds.constant';
import { type UnipileProvider } from 'src/unipile/types/unipile-provider.type';
import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

export const createUnipileHostedAuthLink = async ({
  provider,
  callbackUrl,
  accountScopeId,
  config,
}: {
  provider: Exclude<UnipileProvider, 'mock'>;
  callbackUrl: string;
  accountScopeId?: string;
  config?: NonNullable<CreateAuthLinkData['body']>['config'];
}): Promise<string> => {
  const { data } = await new UnipileHostedAuth().createAuthLink({
    ...getUnipileRequestOptions(),
    body: {
      providers: [provider],
      account_scope_id: accountScopeId,
      // Unipile only adds back a separate `state` on success, so it stays in the URL to come back on failures too
      redirect_uri: callbackUrl,
      config,
      expires_on: new Date(
        Date.now() + UNIPILE_HOSTED_AUTH_LINK_TTL_MILLISECONDS,
      ).toISOString(),
    },
  });

  return data.link;
};
