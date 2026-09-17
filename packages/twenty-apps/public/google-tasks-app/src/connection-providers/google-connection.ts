import { defineConnectionProvider } from 'twenty-sdk/define';
import { GOOGLE_TASKS_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { GOOGLE_TASKS_CONNECTION_PROVIDER_NAME } from 'src/constants/sync';

export default defineConnectionProvider({
  universalIdentifier: GOOGLE_TASKS_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: GOOGLE_TASKS_CONNECTION_PROVIDER_NAME,
  displayName: 'Google Tasks',
  type: 'oauth',
  oauth: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
    scopes: ['https://www.googleapis.com/auth/tasks'],
    clientIdVariable: 'GOOGLE_TASKS_CLIENT_ID',
    clientSecretVariable: 'GOOGLE_TASKS_CLIENT_SECRET',
    tokenRequestContentType: 'form-urlencoded',
    usePkce: true,
    authorizationParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});
