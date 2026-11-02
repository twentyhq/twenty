import { type defineConnectionProvider } from 'twenty-sdk/define';

type OAuthConnectionProviderConfig = Extract<
  Parameters<typeof defineConnectionProvider>[0],
  { type: 'oauth' }
>['oauth'];

export const TEAMS_OAUTH_CONFIG: OAuthConnectionProviderConfig = {
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
};
