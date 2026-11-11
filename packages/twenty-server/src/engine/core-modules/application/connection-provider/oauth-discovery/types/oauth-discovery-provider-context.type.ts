import { type OAuthDiscoveryConnectionProvider } from 'src/engine/core-modules/application/connection-provider/utils/assert-oauth-discovery-provider.util';

export type OAuthDiscoveryProviderContext = {
  provider: OAuthDiscoveryConnectionProvider;
  workspaceId: string;
};
