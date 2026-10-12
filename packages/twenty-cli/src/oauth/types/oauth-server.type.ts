export type OAuthServer = {
  issuer: string;
  isIssuerInResponse: boolean;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  clientId: string;
};
