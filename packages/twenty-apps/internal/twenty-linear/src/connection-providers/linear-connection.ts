import { defineConnectionProvider } from 'twenty-sdk/define';

import { LINEAR_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: LINEAR_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'linear',
  displayName: 'Linear',
  // No `icon` set here on purpose: Tabler doesn't have brand icons for most
  // OAuth providers, so the connection-provider manifest needs a `logoUrl`
  // field (mirroring `defineApplication({ logoUrl })`) before this is a
  // worth-having field. Tracked separately.
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://linear.app/oauth/authorize',
    tokenEndpoint: 'https://api.linear.app/oauth/token',
    revokeEndpoint: 'https://api.linear.app/oauth/revoke',
    scopes: ['read', 'write'],
    clientIdVariable: 'LINEAR_CLIENT_ID',
    clientSecretVariable: 'LINEAR_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
    // Linear supports PKCE but doesn't require it for confidential clients.
    // Disabled to keep the test surface minimal.
    usePkce: false,
  },
});
