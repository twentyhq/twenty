import { defineConnectionProvider } from 'twenty-sdk/define';

import { GITHUB_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// No revokeEndpoint: GitHub revokes grants through its REST API, not an RFC 7009 endpoint
export default defineConnectionProvider({
  universalIdentifier: GITHUB_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'github-user',
  displayName: 'GitHub',
  type: 'oauth',
  scope: 'USER',
  oauth: {
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    scopes: [
      'repo',
      'read:org',
      'read:user',
      'user:email',
      'project',
      'notifications',
    ],
    clientIdVariable: 'GITHUB_CLIENT_ID',
    clientSecretVariable: 'GITHUB_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
  },
});
