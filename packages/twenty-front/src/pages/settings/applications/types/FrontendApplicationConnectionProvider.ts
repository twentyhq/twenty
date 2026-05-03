// OAuth-specific runtime config exposed by the GraphQL schema. Future
// credential types (PATs, API keys, basic auth) add their own sibling
// sub-objects on FrontendApplicationConnectionProvider — purely additive,
// never replaces this.
export type FrontendApplicationConnectionProviderOAuthConfig = {
  scopes: string[];
  // false when the server admin hasn't filled in the OAuth client_id /
  // client_secret on the application registration. Surface a hint to the
  // user and disable "Add connection" in that case.
  isClientCredentialsConfigured: boolean;
};

export type FrontendApplicationConnectionProvider = {
  id: string;
  applicationId: string;
  type: 'oauth';
  name: string;
  displayName: string;
  icon: string | null;
  oauth: FrontendApplicationConnectionProviderOAuthConfig | null;
};
