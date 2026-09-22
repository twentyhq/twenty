import {
  findConnectionForRequest,
  listConnections,
  type LogicFunctionExecutionContext,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TEAMS_PROVIDER_NAME } from 'src/features/transcripts/constants/teams.constant';

export const getTeamsConnectionForRequest = async (
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
) => {
  const connection = findConnectionForRequest(
    await listConnections({ providerName: TEAMS_PROVIDER_NAME }),
    context,
  );

  if (!isDefined(connection)) {
    throw new Error(
      'Microsoft Teams is not connected. Open Microsoft Teams app settings and add a connection first.',
    );
  }

  if (isDefined(connection.authFailedAt)) {
    throw new Error('Reconnect Microsoft Teams in the app settings');
  }

  return connection;
};
