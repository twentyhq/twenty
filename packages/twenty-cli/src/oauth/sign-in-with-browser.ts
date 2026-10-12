import { randomBytes } from 'node:crypto';

import { createPkcePair } from '@/oauth/create-pkce-pair';
import { discoverOAuthServer } from '@/oauth/discover-oauth-server';
import { openBrowser } from '@/oauth/open-browser';
import { requestOAuthTokens } from '@/oauth/request-oauth-tokens';
import { startCallbackServer } from '@/oauth/start-callback-server';
import { type Output } from '@/output/types/output.type';

export const signInWithBrowser = async ({
  apiUrl,
  output,
  signal,
}: {
  apiUrl: string;
  output: Output;
  signal: AbortSignal;
}) => {
  const oauthServer = await discoverOAuthServer({ apiUrl, signal });
  const { codeVerifier, codeChallenge } = createPkcePair();
  const state = randomBytes(16).toString('base64url');
  const callbackServer = await startCallbackServer({
    state,
    issuer: oauthServer.issuer,
    isIssuerInResponse: oauthServer.isIssuerInResponse,
    signal,
  });

  try {
    const authorizationUrl = new URL(oauthServer.authorizationEndpoint);

    authorizationUrl.searchParams.set('response_type', 'code');
    authorizationUrl.searchParams.set('client_id', oauthServer.clientId);
    authorizationUrl.searchParams.set('code_challenge', codeChallenge);
    authorizationUrl.searchParams.set('code_challenge_method', 'S256');
    authorizationUrl.searchParams.set(
      'redirect_uri',
      callbackServer.redirectUri,
    );
    authorizationUrl.searchParams.set('state', state);

    output.progress(
      `Opening your browser to sign in to ${new URL(apiUrl).host}…`,
    );

    openBrowser(authorizationUrl.href);
    output.progress(`If nothing opens, visit: ${authorizationUrl.href}`);
    output.progress(
      'Waiting for you to approve in the browser. Press Ctrl+C to cancel.',
    );

    const code = await callbackServer.waitForCode();
    const tokens = await requestOAuthTokens({
      apiUrl,
      tokenEndpoint: oauthServer.tokenEndpoint,
      parameters: {
        grant_type: 'authorization_code',
        code,
        code_verifier: codeVerifier,
        redirect_uri: callbackServer.redirectUri,
        client_id: oauthServer.clientId,
      },
      signal,
    });

    return { ...tokens, clientId: oauthServer.clientId };
  } finally {
    callbackServer.close();
  }
};
