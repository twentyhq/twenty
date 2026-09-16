import { defineConnectionProvider } from 'twenty-sdk/define';

import { GOOGLE_CONTACTS_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineConnectionProvider({
  universalIdentifier: GOOGLE_CONTACTS_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
  name: 'google-contacts',
  displayName: 'Google Contacts',
  type: 'oauth',
  logo: 'public/logo.svg',
  oauth: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
    scopes: ['https://www.googleapis.com/auth/contacts'],
    clientIdVariable: 'GOOGLE_CONTACTS_CLIENT_ID',
    clientSecretVariable: 'GOOGLE_CONTACTS_CLIENT_SECRET',
    authorizationParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
});
