import { LEGACY_CONNECTION_VISIBILITY_BY_SCOPE } from 'twenty-shared/application-runtime';

import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

export const withLegacyConnectionVisibility = (
  connection: Omit<AppConnection, 'visibility'>,
): AppConnection => ({
  ...connection,
  visibility: LEGACY_CONNECTION_VISIBILITY_BY_SCOPE[connection.scope],
});
