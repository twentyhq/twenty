import { type defineConnectionProvider } from 'twenty-sdk/define';

import {
  GOOGLE_CLIENT_ID_SERVER_VARIABLE_NAME,
  GOOGLE_CLIENT_SECRET_SERVER_VARIABLE_NAME,
  GOOGLE_DOCS_READONLY_SCOPE,
  GOOGLE_DRIVE_MEET_READONLY_SCOPE,
  GOOGLE_MEET_READONLY_SCOPE,
} from 'src/constants/google-meet.constant';

type OAuthConnectionProviderConfig = Extract<
  Parameters<typeof defineConnectionProvider>[0],
  { type: 'oauth' }
>['oauth'];

export const GOOGLE_MEET_OAUTH_CONFIG: OAuthConnectionProviderConfig = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revokeEndpoint: 'https://oauth2.googleapis.com/revoke',
  scopes: [
    'openid',
    'email',
    GOOGLE_MEET_READONLY_SCOPE,
    GOOGLE_DOCS_READONLY_SCOPE,
    GOOGLE_DRIVE_MEET_READONLY_SCOPE,
  ],
  clientIdVariable: GOOGLE_CLIENT_ID_SERVER_VARIABLE_NAME,
  clientSecretVariable: GOOGLE_CLIENT_SECRET_SERVER_VARIABLE_NAME,
  // Google only issues a refresh token for offline access with a fresh consent.
  authorizationParams: { access_type: 'offline', prompt: 'consent' },
  tokenRequestContentType: 'form-urlencoded',
  usePkce: true,
};
