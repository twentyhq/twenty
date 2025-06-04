export interface GetAuthTokenInput {
  client_id: string;
  client_secret: string;
  grant_type: string;
  scope: string;
}

export interface GetAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}
