import { LEGACY_CONNECTION_VISIBILITY_BY_SCOPE } from 'twenty-shared/application-runtime';

import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

type WithoutVisibility<TConnection> = TConnection extends unknown
  ? Omit<TConnection, 'visibility'>
  : never;

export type AppConnectionWithoutVisibility = WithoutVisibility<AppConnection>;

export const withLegacyConnectionVisibility = (
  connection: AppConnectionWithoutVisibility,
): AppConnection => ({
  ...connection,
  visibility: LEGACY_CONNECTION_VISIBILITY_BY_SCOPE[connection.scope],
});
