import {
  findConnectionForRequest,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TeamsConnectionUnavailableError } from 'src/features/transcripts/logic-functions/types/teams-connection-unavailable-error';
import { listTeamsConnections } from 'src/features/transcripts/logic-functions/utils/list-teams-connections';

export const getTeamsConnectionForRequestOrThrow = async (
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
  {
    isOwnConnectionRequired = false,
  }: { isOwnConnectionRequired?: boolean } = {},
) => {
  const connections = await listTeamsConnections();
  const connection = findConnectionForRequest(
    isOwnConnectionRequired
      ? connections.filter(
          (connection) =>
            isDefined(context.userWorkspaceId) &&
            connection.userWorkspaceId === context.userWorkspaceId,
        )
      : connections,
    context,
  );

  if (!isDefined(connection)) {
    throw new TeamsConnectionUnavailableError({
      message:
        'Microsoft Teams is not connected. Open Microsoft Teams app settings and add a connection first.',
      code: 'not-connected',
    });
  }

  if (isDefined(connection.authFailedAt)) {
    throw new TeamsConnectionUnavailableError({
      message: 'Reconnect Microsoft Teams in the app settings.',
      code: 'reconnect-required',
    });
  }

  return connection;
};
