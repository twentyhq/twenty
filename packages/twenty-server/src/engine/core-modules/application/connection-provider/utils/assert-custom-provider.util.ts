import { type StoredCustomConnectionProviderConfig } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';

export type CustomConnectionProvider = ConnectionProviderEntity & {
  type: 'custom';
  customConfig: StoredCustomConnectionProviderConfig;
};

export function assertCustomProvider(
  provider: ConnectionProviderEntity,
): asserts provider is CustomConnectionProvider {
  if (provider.type !== 'custom' || !isDefined(provider.customConfig)) {
    throw new ConnectionProviderException(
      `Connection provider "${provider.name}" (id ${provider.id}) is not custom-typed or has no customConfig`,
      ConnectionProviderExceptionCode.INVALID_REQUEST,
    );
  }
}
