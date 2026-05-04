import { type StoredOAuthConnectionProviderConfig } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { ConnectionProviderExceptionCode } from 'src/engine/core-modules/application/connection-provider/connection-provider-exception-code.enum';
import { ConnectionProviderException } from 'src/engine/core-modules/application/connection-provider/connection-provider.exception';

// Narrows a generic ConnectionProviderEntity to its OAuth-typed shape so
// callers in the OAuth flow can read `provider.oauthConfig.x` without
// optional chaining or non-null assertions. Throws on type mismatch — the
// invariant is `type === 'oauth'` ⇔ `oauthConfig` is non-null.
export type OAuthConnectionProvider = ConnectionProviderEntity & {
  type: 'oauth';
  oauthConfig: StoredOAuthConnectionProviderConfig;
};

export function assertOAuthProvider(
  provider: ConnectionProviderEntity,
): asserts provider is OAuthConnectionProvider {
  if (provider.type !== 'oauth' || !isDefined(provider.oauthConfig)) {
    throw new ConnectionProviderException(
      `Connection provider "${provider.name}" (id ${provider.id}) is not OAuth-typed or has no oauthConfig`,
      ConnectionProviderExceptionCode.INVALID_REQUEST,
    );
  }
}
