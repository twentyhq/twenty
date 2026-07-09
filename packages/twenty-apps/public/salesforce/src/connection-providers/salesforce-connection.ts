import { defineConnectionProvider } from 'twenty-sdk/define';

import { SALESFORCE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const SALESFORCE_CONNECTION_PROVIDER_NAME = 'salesforce';

export default defineConnectionProvider({
  universalIdentifier: SALESFORCE_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: SALESFORCE_CONNECTION_PROVIDER_NAME,
  displayName: 'Salesforce',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://login.salesforce.com/services/oauth2/authorize',
    tokenEndpoint: 'https://login.salesforce.com/services/oauth2/token',
    revokeEndpoint: 'https://login.salesforce.com/services/oauth2/revoke',
    // openid is required for the userinfo endpoint, which is how the app
    // resolves the org's instance URL from the access token.
    scopes: ['api', 'refresh_token', 'openid'],
    clientIdVariable: 'SALESFORCE_CLIENT_ID',
    clientSecretVariable: 'SALESFORCE_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
    usePkce: true,
  },
});
