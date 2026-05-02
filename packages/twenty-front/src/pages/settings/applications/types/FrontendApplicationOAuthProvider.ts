export type FrontendApplicationOAuthProvider = {
  id: string;
  applicationId: string;
  name: string;
  displayName: string;
  icon: string | null;
  scopes: string[];
  // false when the server admin hasn't filled in the OAuth client_id /
  // client_secret on the application registration. Surface a hint to the
  // user and disable "Add connection" in that case.
  isClientCredentialsConfigured: boolean;
};
