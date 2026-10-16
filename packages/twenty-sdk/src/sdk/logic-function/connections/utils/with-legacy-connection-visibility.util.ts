import { LEGACY_CONNECTION_VISIBILITY_BY_SCOPE } from 'twenty-shared/application';

import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

// Derived locally so the SDK stays off the server's deprecated visibility field
export const withLegacyConnectionVisibility = (
  connection: Omit<AppConnection, 'visibility'>,
): AppConnection => ({
  ...connection,
  visibility: LEGACY_CONNECTION_VISIBILITY_BY_SCOPE[connection.scope],
});
