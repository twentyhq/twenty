import {
  type ConnectionProviderScope,
  type ConnectionProviderType,
} from 'twenty-shared/application';

import { type ApplicationBillingPrice } from '~/generated-metadata/graphql';

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
  scope: ConnectionProviderScope;
  logoUrl: string | null;
  oauth: FrontendApplicationConnectionProviderOAuthConfig | null;
  connectedAccountPrices: ApplicationBillingPrice[];
};
