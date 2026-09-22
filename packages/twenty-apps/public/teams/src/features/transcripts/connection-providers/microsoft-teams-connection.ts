import { defineConnectionProvider } from 'twenty-sdk/define';

import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams.constant';
import { TEAMS_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/features/transcripts/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: TEAMS_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: TEAMS_PROVIDER_NAME,
  displayName: 'Microsoft Teams',
  type: 'oauth',
  oauth: {
    authorizationEndpoint:
      'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize',
    tokenEndpoint:
      'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
    scopes: [
      'openid',
      'profile',
      'email',
      'offline_access',
      'https://graph.microsoft.com/User.Read',
      'https://graph.microsoft.com/Calendars.ReadBasic',
      'https://graph.microsoft.com/OnlineMeetings.Read',
      'https://graph.microsoft.com/OnlineMeetingTranscript.Read.All',
    ],
    clientIdVariable: 'MICROSOFT_CLIENT_ID',
    clientSecretVariable: 'MICROSOFT_CLIENT_SECRET',
    authorizationParams: { prompt: 'select_account' },
    tokenRequestContentType: 'form-urlencoded',
    usePkce: true,
  },
});
