import { type OAuthClientMetadata } from '@modelcontextprotocol/sdk/shared/auth.js';

import { buildAppOAuthCallbackUrl } from 'src/engine/core-modules/application/connection-provider/utils/build-callback-url.util';
import { TWENTY_CURRENT_VERSION } from 'src/engine/core-modules/upgrade/constants/twenty-current-version.constant';

const TWENTY_WEBSITE_URL = 'https://twenty.com';
const TWENTY_LOGO_PATH = '/images/icons/ios/192.png';

export const buildOAuthDiscoveryClientMetadata = ({
  serverUrl,
  frontendUrl,
}: {
  serverUrl: string;
  frontendUrl: string;
}): OAuthClientMetadata => ({
  client_name: 'Twenty',
  client_uri: TWENTY_WEBSITE_URL,
  logo_uri: new URL(TWENTY_LOGO_PATH, frontendUrl).toString(),
  software_id: 'twenty',
  software_version: TWENTY_CURRENT_VERSION,
  redirect_uris: [buildAppOAuthCallbackUrl(serverUrl)],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  token_endpoint_auth_method: 'none',
});
