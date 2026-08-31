import { defineConnectionProvider } from 'twenty-sdk/define';

import { FIREFLIES_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

const firefliesConnectionProviderConfig = {
  universalIdentifier: FIREFLIES_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'fireflies',
  displayName: 'Fireflies',
  type: 'oauth' as const,
  oauth: {
    authorizationEndpoint:
      'https://user-service-rest.fireflies.ai/auth/oidc/authorize',
    tokenEndpoint:
      'https://user-service-rest.fireflies.ai/auth/oidc-oauth/token',
    scopes: ['openid', 'meetings.read.user', 'offline_access'],
    clientIdVariable: 'FIREFLIES_CLIENT_ID',
    clientSecretVariable: 'FIREFLIES_CLIENT_SECRET',
    tokenEndpointAuthMethod: 'client_secret_basic' as const,
    tokenRequestContentType: 'form-urlencoded' as const,
    usePkce: true,
  },
};

export default defineConnectionProvider(firefliesConnectionProviderConfig);
