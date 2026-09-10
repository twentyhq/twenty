import { defineConnectionProvider } from 'twenty-sdk/define';

import { LINEAR_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: LINEAR_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'linear',
  displayName: 'Linear',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://linear.app/oauth/authorize',
    tokenEndpoint: 'https://api.linear.app/oauth/token',
    revokeEndpoint: 'https://api.linear.app/oauth/revoke',
    scopes: ['read', 'write'],
    clientIdVariable: 'LINEAR_CLIENT_ID',
    clientSecretVariable: 'LINEAR_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
    usePkce: true,
  },
});
