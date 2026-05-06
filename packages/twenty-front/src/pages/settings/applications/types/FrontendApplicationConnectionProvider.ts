import { type ConnectionProviderType } from 'twenty-shared/application';

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
  type: ConnectionProviderType;
  name: string;
  displayName: string;
  oauth: FrontendApplicationConnectionProviderOAuthConfig | null;
};
