// The shape returned by `useOAuth` after the not-connected check passes.
// `accessToken` is non-null, distinct from `OAuthBinding` (returned by
// `useOptionalOAuth`) where `accessToken` may be null.
export type ConnectedOAuthBinding = {
  accessToken: string;
  scopes: string[];
  handle: string | null;
  connectedAccountId: string | null;
};
