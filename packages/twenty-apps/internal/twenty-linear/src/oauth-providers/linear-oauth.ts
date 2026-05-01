import { defineOAuthProvider } from 'twenty-sdk/define';

import { LINEAR_OAUTH_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineOAuthProvider({
  universalIdentifier: LINEAR_OAUTH_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'linear',
  displayName: 'Linear',
  icon: 'IconBrandLinear',
  authorizationEndpoint: 'https://linear.app/oauth/authorize',
  tokenEndpoint: 'https://api.linear.app/oauth/token',
  scopes: ['read', 'write'],
  connectionMode: 'per-user',
  clientIdVariable: 'LINEAR_CLIENT_ID',
  clientSecretVariable: 'LINEAR_CLIENT_SECRET',
  tokenRequestContentType: 'form-urlencoded',
  // Linear supports PKCE but doesn't require it for confidential clients.
  // Disabled to keep the test surface minimal.
  usePkce: false,
});
