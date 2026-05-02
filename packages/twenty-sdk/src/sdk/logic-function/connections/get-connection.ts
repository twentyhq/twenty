import {
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
} from 'twenty-shared/application';

import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

// Returns a single connection by id, refreshed. Throws when the id does
// not belong to the running app or — if the execution carries a user
// context — when the connection is `scope: 'user'` and owned by a
// different user.
export const getConnection = async (id: string): Promise<AppConnection> => {
  const apiUrl = process.env[DEFAULT_API_URL_NAME];
  const accessToken = process.env[DEFAULT_APP_ACCESS_TOKEN_NAME];

  if (!apiUrl || !accessToken) {
    throw new Error(
      'getConnection() requires the app runtime env vars ' +
        `${DEFAULT_API_URL_NAME} and ${DEFAULT_APP_ACCESS_TOKEN_NAME}.`,
    );
  }

  const response = await fetch(`${apiUrl}/apps/connections/get`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    throw new Error(
      `getConnection(${id}) failed: HTTP ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as AppConnection;
};
