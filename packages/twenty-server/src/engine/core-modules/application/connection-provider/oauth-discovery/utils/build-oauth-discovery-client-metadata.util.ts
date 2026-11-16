import { type OAuthClientMetadata } from '@modelcontextprotocol/sdk/shared/auth.js';

import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';

const TWENTY_WEBSITE_URL = 'https://twenty.com';

export const buildOAuthDiscoveryClientMetadata = (
  serverUrl: string,
): OAuthClientMetadata => ({
  client_name: 'Twenty',
  client_uri: TWENTY_WEBSITE_URL,
  redirect_uris: [buildAppOAuthCallbackUrl(serverUrl)],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none',
});
