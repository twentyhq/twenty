import { defineConnectionProvider } from 'twenty-sdk/define';

import { SLACK_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: SLACK_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'slack',
  displayName: 'Slack',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://slack.com/oauth/v2/authorize',
    tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
    revokeEndpoint: 'https://slack.com/api/auth.revoke',
    scopes: ['chat:write', 'reactions:write'],
    clientIdVariable: 'SLACK_CLIENT_ID',
    clientSecretVariable: 'SLACK_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
    usePkce: false,
  },
});
