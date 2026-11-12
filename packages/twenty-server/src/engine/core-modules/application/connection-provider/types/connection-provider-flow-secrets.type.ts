export type ConnectionProviderFlowSecrets = {
  codeVerifier: string | null;
  tokenEndpoint: string;
  clientId: string;
  browserNonce: string;
};
