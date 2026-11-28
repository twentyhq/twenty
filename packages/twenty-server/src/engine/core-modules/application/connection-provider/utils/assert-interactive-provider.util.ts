import { type StoredInteractiveConnectionProviderConfig } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';

export type InteractiveConnectionProvider = ConnectionProviderEntity & {
  type: 'interactive';
  interactiveConfig: StoredInteractiveConnectionProviderConfig;
};

export function assertInteractiveProvider(
  provider: ConnectionProviderEntity,
): asserts provider is InteractiveConnectionProvider {
  if (
    provider.type !== 'interactive' ||
    !isDefined(provider.interactiveConfig)
  ) {
    throw new ConnectionProviderException(
      `Connection provider "${provider.name}" (id ${provider.id}) is not interactive-typed or has no interactiveConfig`,
      ConnectionProviderExceptionCode.INVALID_REQUEST,
    );
  }
}
