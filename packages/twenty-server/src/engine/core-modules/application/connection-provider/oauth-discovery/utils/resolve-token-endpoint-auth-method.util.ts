import { type OAuthClientInformationFull } from '@modelcontextprotocol/sdk/shared/auth.js';
import { isDefined } from 'twenty-shared/utils';

import { type OAuthTokenEndpointAuthMethod } from 'src/engine/core-modules/application/connection-provider/types/resolved-oauth-client.type';

export const resolveTokenEndpointAuthMethod = ({
  client_secret: clientSecret,
  token_endpoint_auth_method: registeredMethod,
}: Pick<
  OAuthClientInformationFull,
  'client_secret' | 'token_endpoint_auth_method'
>): OAuthTokenEndpointAuthMethod => {
  if (!isDefined(clientSecret) || registeredMethod === 'none') {
    return 'none';
  }

  // RFC 7591 section 2: a registration that names no method means client_secret_basic
  return registeredMethod === 'client_secret_post'
    ? 'client_secret_post'
    : 'client_secret_basic';
};
