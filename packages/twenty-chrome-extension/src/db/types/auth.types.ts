export type AuthToken = {
  token: string;
  expiresAt: Date;
};

export type ExchangeAuthCodeInput = {
  authorizationCode: string;
  codeVerifier?: string;
  clientSecret?: string;
};

export type Tokens = {
  loginToken: AuthToken;
  authToken: AuthToken;
  refreshToken: AuthToken;
};

export type ExchangeAuthCodeResponse = {
  exchangeAuthorizationCode: Tokens;
};
