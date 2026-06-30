import { type AppConnection } from '@/sdk/logic-function/connections/types/app-connection.type';

export const findConnectionForRequest = (
  connections: AppConnection[],
  event: { userWorkspaceId: string | null },
): AppConnection | null => {
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

  const workspaceShared = connections.find(
    (connection) => connection.visibility === 'workspace',
  );

  return workspaceShared ?? null;
};
