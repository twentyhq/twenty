import { defineLogicFunction } from 'twenty-sdk';

export type OAuthApplicationVariables = {
  apolloClientId: string;
  apolloRegisteredUrl: string;
  apolloOAuthUrl: string;
  apolloAccessToken: string;
  apolloRefreshToken: string;
};

const handler = async (): Promise<OAuthApplicationVariables> => {
  const apolloClientId = process.env.APOLLO_CLIENT_ID ?? '';
  const apolloRegisteredUrl = process.env.APOLLO_REGISTERED_URL ?? '';
  const apolloOAuthUrl = process.env.APOLLO_OAUTH_URL ?? '';
  const apolloAccessToken = process.env.APOLLO_ACCESS_TOKEN ?? '';
  const apolloRefreshToken = process.env.APOLLO_REFRESH_TOKEN ?? '';

  return { apolloClientId, apolloRegisteredUrl, apolloOAuthUrl, apolloAccessToken, apolloRefreshToken };
};

export default defineLogicFunction({
  universalIdentifier: 'b7c3e8f1-9d4a-4e2b-8f6c-1a5d3e7b9c2f',
  name: 'get-oauth-application-variables',
  description: 'Returns the Apollo OAuth authorization URL',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/oauth/application-variables',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
