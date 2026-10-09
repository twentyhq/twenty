import { CONNECTED_ACCOUNT_PERMISSION_SCOPES } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';

// email and profile take no googleapis.com/auth/ prefix, see https://developers.google.com/identity/protocols/oauth2/scopes
export const getGoogleApisOauthScopes = (): string[] => {
  return [
    'email',
    'profile',
    ...CONNECTED_ACCOUNT_PERMISSION_SCOPES.READ_EMAILS[
      ConnectedAccountProvider.GOOGLE
    ],
    ...CONNECTED_ACCOUNT_PERMISSION_SCOPES.MANAGE_EVENTS[
      ConnectedAccountProvider.GOOGLE
    ],
    'https://www.googleapis.com/auth/profile.emails.read',
    ...CONNECTED_ACCOUNT_PERMISSION_SCOPES.SEND_EMAILS[
      ConnectedAccountProvider.GOOGLE
    ],
  ];
};
