import { type StoredOAuthDiscoveryConnectionProviderConfig } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';

export type OAuthDiscoveryConnectionProvider = ConnectionProviderEntity & {
  type: 'oauth-discovery';
  oauthDiscoveryConfig: StoredOAuthDiscoveryConnectionProviderConfig;
};

export function assertOAuthDiscoveryProvider(
  provider: ConnectionProviderEntity,
): asserts provider is OAuthDiscoveryConnectionProvider {
  if (
    provider.type !== 'oauth-discovery' ||
    !isDefined(provider.oauthDiscoveryConfig)
  ) {
    throw new ConnectionProviderException(
      `Connection provider "${provider.name}" (id ${provider.id}) is not OAuth-discovery-typed or has no oauthDiscoveryConfig`,
      ConnectionProviderExceptionCode.INVALID_REQUEST,
    );
  }
}
