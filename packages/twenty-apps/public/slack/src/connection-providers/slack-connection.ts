import { defineConnectionProvider } from 'twenty-sdk/define';

import {
  SLACK_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  SLACK_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  SLACK_TEAM_RELEASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: SLACK_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'slack',
  displayName: 'Slack',
  type: 'oauth',
  onConnectLogicFunction: {
    universalIdentifier: SLACK_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  },
  onDisconnectLogicFunction: {
    universalIdentifier: SLACK_TEAM_RELEASE_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  },
  oauth: {
    authorizationEndpoint: 'https://slack.com/oauth/v2/authorize',
    tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
    revokeEndpoint: 'https://slack.com/api/auth.revoke',
    scopes: [
      'channels:read',
      'chat:write',
      'chat:write.public',
      'groups:read',
      'reactions:write',
      // Only used by the conversational assistant
      'app_mentions:read',
      'channels:history',
      'groups:history',
      'im:history',
      'im:read',
      'users:read',
      'users:read.email',
      'assistant:write',
    ],
    clientIdVariable: 'SLACK_CLIENT_ID',
    clientSecretVariable: 'SLACK_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
    usePkce: true,
  },
});
