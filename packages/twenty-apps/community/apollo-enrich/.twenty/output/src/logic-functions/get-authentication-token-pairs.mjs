import { createRequire as __createRequire } from 'module';
const require = __createRequire(import.meta.url);

// src/logic-functions/get-authentication-token-pairs.ts
import { defineLogicFunction } from "twenty-sdk";
var OAUTH_TOKEN_PAIRS_PATH = "/oauth/token-pairs";
var getAuthenticationTokenPairs = async (code, clientId, clientSecret) => {
  const formData = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    code,
    redirect_uri: "https://hjsm0q38-3000.uks1.devtunnels.ms/auth/oauth-propagator/callback"
  });
  const response = await fetch("https://app.apollo.io/api/v1/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString()
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to exchange code for tokens: ${response.status} - ${errorText}`);
  }
  return response.json();
};
var handler = async (event) => {
  const { queryStringParameters: { code } } = event;
  if (!code) {
    throw new Error("Code is required");
  }
  const apolloClientId = process.env.APOLLO_CLIENT_ID ?? "";
  const apolloClientSecret = process.env.APOLLO_CLIENT_SECRET ?? "";
  const tokenPairs = await getAuthenticationTokenPairs(
    code,
    apolloClientId,
    apolloClientSecret
  );
  return tokenPairs;
};
var get_authentication_token_pairs_default = defineLogicFunction({
  universalIdentifier: "7ccc63a7-ece1-44c0-adbe-805a1baea03a",
  name: "get-authentication-token-pairs",
  description: "Returns the Apollo authentication token pairs",
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: OAUTH_TOKEN_PAIRS_PATH,
    httpMethod: "GET",
    isAuthRequired: false
  }
});
export {
  OAUTH_TOKEN_PAIRS_PATH,
  get_authentication_token_pairs_default as default
};
//# sourceMappingURL=get-authentication-token-pairs.mjs.map
