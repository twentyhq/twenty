export type ConnectionProviderFlowSecrets = {
  codeVerifier: string | null;
  tokenEndpoint: string;
  clientId: string;
  scopes: string[];
  browserNonce: string;
};
