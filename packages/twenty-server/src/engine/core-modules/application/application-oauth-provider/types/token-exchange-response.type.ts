export type TokenExchangeResponse = {
  accessToken: string;
  refreshToken: string | null;
  scopes: string[] | null;
  expiresInMs: number | null;
  raw: Record<string, unknown>;
};
