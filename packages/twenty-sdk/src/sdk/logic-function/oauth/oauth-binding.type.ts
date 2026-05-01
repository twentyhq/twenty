export type OAuthBinding = {
  isConnected: boolean;
  accessToken: string | null;
  scopes: string[];
  handle: string | null;
  connectedAccountId: string | null;
};
