export type TokenExchangeResponse = {
  accessToken: string;
  refreshToken: string | null;
  scopes: string[] | null;
};
