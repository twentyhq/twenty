import { type LogicFunctionEvent } from 'twenty-shared/types';

import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

// Picks the connection that matches the request user, falling back to a
// workspace-shared one. Pure helper — does not refresh tokens. Returns
// null when nothing fits so the caller can decide whether to surface an
// error or skip the work.
export const findConnectionForRequest = (
  connections: AppConnection[],
  event: Pick<LogicFunctionEvent, 'userWorkspaceId'>,
): AppConnection | null => {
  if (event.userWorkspaceId !== null) {
    const ownConnection = connections.find(
      (connection) => connection.userWorkspaceId === event.userWorkspaceId,
    );

    if (ownConnection) {
      return ownConnection;
    }
  }

  return (
    connections.find((connection) => connection.scope === 'workspace') ?? null
  );
};
