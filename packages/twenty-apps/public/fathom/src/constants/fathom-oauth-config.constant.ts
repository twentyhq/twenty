import { type defineConnectionProvider } from 'twenty-sdk/define';

type OAuthConnectionProviderConfig = Extract<
  Parameters<typeof defineConnectionProvider>[0],
  { type: 'oauth' }
>['oauth'];

export const FATHOM_OAUTH_CONFIG: OAuthConnectionProviderConfig = {
  authorizationEndpoint: 'https://fathom.video/external/v1/oauth2/authorize',
  tokenEndpoint: 'https://api.fathom.ai/external/v1/oauth2/token',
  scopes: ['public_api'],
  clientIdVariable: 'FATHOM_CLIENT_ID',
  clientSecretVariable: 'FATHOM_CLIENT_SECRET',
  tokenRequestContentType: 'form-urlencoded',
  usePkce: false,
};
