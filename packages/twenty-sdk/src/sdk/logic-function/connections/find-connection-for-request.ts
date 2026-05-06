import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

// Resolution rule for an HTTP-route handler that wants "the request user's
// connection, or fall back to a workspace-shared one." Pure function — no
// network. Pass it the result of `listConnections` and the trigger event.
//
// The plan-of-record for picking a connection is documented in the v3 plan
// notes; this utility encodes the most common case so handlers don't have
// to repeat the same `find(...) ?? find(...)` chain.
//
// Returns `null` when no candidate exists — caller decides whether that's
// a 4xx for the end user or a hard error.
export const findConnectionForRequest = (
  connections: AppConnection[],
  event: { userWorkspaceId: string | null },
): AppConnection | null => {
  // 1. Personal credential of the request user (highest specificity).
  if (event.userWorkspaceId !== null) {
    const personal = connections.find(
      (connection) =>
        connection.visibility === 'user' &&
        connection.userWorkspaceId === event.userWorkspaceId,
    );

    if (personal) {
      return personal;
    }
  }

  // 2. Any workspace-shared credential (team-managed service account).
  const workspaceShared = connections.find(
    (connection) => connection.visibility === 'workspace',
  );

  return workspaceShared ?? null;
};
