import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';
import { postConnectionsEndpoint } from '@/sdk/logic-function/connections/utils/post-connections-endpoint.util';

export type ListConnectionsFilter = {
  // Provider name as declared on `defineConnectionProvider({ name })`.
  providerName?: string;
  // Restrict to credentials owned by a specific user. Useful in cron
  // triggers when picking a service-account user via app config.
  userWorkspaceId?: string;
  // Restrict by row visibility — 'user' (private) or 'workspace' (shared).
  visibility?: 'user' | 'workspace';
};

// Returns every connection owned by the running app, optionally filtered.
// The server refreshes each access token on read, so the returned values
// are usable immediately. When the running execution carries a user
// context (HTTP-route trigger with `isAuthRequired`, tool calls, etc.),
// `scope: 'user'` connections belonging to other users are filtered out
// server-side. Cron and database-event triggers see all connections.
export const listConnections = async (
  filter: ListConnectionsFilter = {},
): Promise<AppConnection[]> =>
  postConnectionsEndpoint<ListConnectionsFilter, AppConnection[]>(
    'list',
    filter,
  );
