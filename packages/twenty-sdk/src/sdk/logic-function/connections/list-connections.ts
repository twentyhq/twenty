import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';

import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

export type ListConnectionsFilter = {
  providerName?: string;
  userWorkspaceId?: string;
  scope?: 'user' | 'workspace';
};

// Returns every connection owned by the running app, optionally filtered.
// The server refreshes each access token on read, so the returned values
// are usable immediately. When the running execution carries a user
// context (HTTP-route trigger with `isAuthRequired`, tool calls, etc.),
// `scope: 'user'` connections belonging to other users are filtered out
// server-side. Cron and database-event triggers see all connections.
export const listConnections = async (
  filter: ListConnectionsFilter = {},
): Promise<AppConnection[]> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const accessToken = process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];

  if (!apiUrl || !accessToken) {
    throw new Error(
      'listConnections() requires the app runtime env vars ' +
        `${DEFAULT_API_URL_NAME} and ${DEFAULT_APP_ACCESS_TOKEN_NAME}.`,
    );
  }

  const response = await fetch(`${apiUrl}/apps/connections/list`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(filter),
  });

  if (!response.ok) {
    throw new Error(
      `listConnections() failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as AppConnection[];
};
