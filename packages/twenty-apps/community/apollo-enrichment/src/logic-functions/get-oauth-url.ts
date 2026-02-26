import { defineLogicFunction } from 'twenty-sdk';

export const GET_OAUTH_URL_UNIVERSAL_IDENTIFIER =
  'b7c3e8f1-9d4a-4e2b-8f6c-1a5d3e7b9c2f';

type GetOAuthUrlResponse = {
  url: string;
};

const handler = async (): Promise<GetOAuthUrlResponse> => {
  const clientId = process.env.APOLLO_CLIENT_ID ?? '';
  const redirectUri = process.env.APOLLO_REDIRECT_URI ?? '';
  const oauthBaseUrl = process.env.APOLLO_OAUTH_URL ?? '';

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
  });

  const url = `${oauthBaseUrl}?${params.toString()}`;

  return { url };
};

export default defineLogicFunction({
  universalIdentifier: GET_OAUTH_URL_UNIVERSAL_IDENTIFIER,
  name: 'get-oauth-url',
  description: 'Returns the Apollo OAuth authorization URL',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/oauth/url',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
