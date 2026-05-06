// Refresh result returned by the app OAuth driver. Mirrors
// `ConnectedAccountTokens` from the central refresh manager but redeclared
// here so this engine-side driver has zero dependency on `modules/`.

export type AppOAuthTokens = {
  accessToken: string;
  refreshToken: string;
};
