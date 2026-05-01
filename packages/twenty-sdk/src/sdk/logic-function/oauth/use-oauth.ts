import { type ConnectedOAuthBinding } from '@/sdk/logic-function/oauth/connected-oauth-binding.type';
import { OAuthNotConnectedError } from '@/sdk/logic-function/oauth/oauth-not-connected.error';
import { useOptionalOAuth } from '@/sdk/logic-function/oauth/use-optional-oauth';

// Returns the OAuth connection for `providerName`, or throws
// `OAuthNotConnectedError` if there isn't one. The returned binding has a
// non-null `accessToken` so handlers don't need a null-check.
//
// Use `useOptionalOAuth` instead when you want to handle the not-connected
// case explicitly inside the handler.
export const useOAuth = (providerName: string): ConnectedOAuthBinding => {
  const binding = useOptionalOAuth(providerName);

  if (!binding.isConnected || binding.accessToken === null) {
    throw new OAuthNotConnectedError(providerName);
  }

  return {
    accessToken: binding.accessToken,
    scopes: binding.scopes,
    handle: binding.handle,
    connectedAccountId: binding.connectedAccountId,
  };
};
