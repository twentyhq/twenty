import { CONNECTED_ACCOUNT_PERMISSION_SCOPES } from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';

export const getMicrosoftApisOauthScopes = (): string[] => {
  const scopes = [
    'openid',
    'email',
    'profile',
    'offline_access',
    ...CONNECTED_ACCOUNT_PERMISSION_SCOPES.READ_EMAILS[
      ConnectedAccountProvider.MICROSOFT
    ],
    ...CONNECTED_ACCOUNT_PERMISSION_SCOPES.SEND_EMAILS[
      ConnectedAccountProvider.MICROSOFT
    ],
    ...CONNECTED_ACCOUNT_PERMISSION_SCOPES.MANAGE_EVENTS[
      ConnectedAccountProvider.MICROSOFT
    ],
    'User.Read',
  ];

  return scopes;
};
