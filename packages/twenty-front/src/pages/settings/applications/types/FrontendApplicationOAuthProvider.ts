import { type OAuthProviderConnectionMode } from 'twenty-shared/application';

export type FrontendApplicationOAuthProvider = {
  id: string;
  applicationId: string;
  name: string;
  displayName: string;
  icon: string | null;
  scopes: string[];
  connectionMode: OAuthProviderConnectionMode;
};
