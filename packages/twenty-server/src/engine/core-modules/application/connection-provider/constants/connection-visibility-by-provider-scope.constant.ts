import { type ConnectionProviderScope } from 'twenty-shared/application';

import { type ConnectedAccountVisibility } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const CONNECTION_VISIBILITY_BY_PROVIDER_SCOPE: Record<
  ConnectionProviderScope,
  ConnectedAccountVisibility
> = {
  WORKSPACE: 'workspace',
  USER: 'user',
};
