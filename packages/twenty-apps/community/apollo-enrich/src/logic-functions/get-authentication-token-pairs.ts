import { defineLogicFunction, RoutePayload } from "twenty-sdk";
import { MetadataApiClient } from 'twenty-sdk/clients';

export const OAUTH_TOKEN_PAIRS_PATH = '/oauth/token-pairs';

type ApolloTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  created_at: number;
};

const getAuthenticationTokenPairs = async (
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<ApolloTokenResponse> => {
  const formData = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    redirect_uri: 'https://hjsm0q38-3000.uks1.devtunnels.ms/auth/oauth-propagator/callback',
  });

  const response = await fetch('https://app.apollo.io/api/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorText}`);
  }

  return response.json();
};

const handler = async (event: RoutePayload): Promise<any> => {
  const { queryStringParameters: { code } } = event;

  if (!code) {
    throw new Error('Code is required');
  }

  const apolloClientId = process.env.APOLLO_CLIENT_ID ?? '';
  const apolloClientSecret = process.env.APOLLO_CLIENT_SECRET ?? '';
  const applicationId = process.env.APPLICATION_ID ?? '';

  const metadataClient = new MetadataApiClient({});

  const tokenPairs = await getAuthenticationTokenPairs(
    code,
    apolloClientId,
    apolloClientSecret,
  );

  await metadataClient.mutation({
    updateOneApplicationVariable: {
      __args: {
          key: 'APOLLO_ACCESS_TOKEN',
          value: tokenPairs.access_token,
          applicationId,
        },
    },
  });

   await metadataClient.mutation({
    updateOneApplicationVariable: {
      __args: {
          key: 'APOLLO_REFRESH_TOKEN',
          value: tokenPairs.refresh_token,
          applicationId,
        },
    },
  });
  return {tokenPairs};
};

export default defineLogicFunction({
  universalIdentifier: '7ccc63a7-ece1-44c0-adbe-805a1baea03a',
  name: 'get-authentication-token-pairs',
  description: 'Returns the Apollo authentication token pairs',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: OAUTH_TOKEN_PAIRS_PATH,
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
