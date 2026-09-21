import {
  findConnectionForRequest,
  listConnections,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';

import { TEAMS_PROVIDER_NAME } from 'src/constants/teams.constant';

export const getTeamsConnectionForRequest = async (
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
) => {
  const connection = findConnectionForRequest(
    await listConnections({ providerName: TEAMS_PROVIDER_NAME }),
    context,
  );

  if (!connection) {
    throw new Error(
      'Microsoft Teams is not connected. Open Teams Transcripts app settings and add a connection first.',
    );
  }

  if (connection.authFailedAt) {
    throw new Error('Reconnect Microsoft Teams in the app settings');
  }

  return connection;
};
