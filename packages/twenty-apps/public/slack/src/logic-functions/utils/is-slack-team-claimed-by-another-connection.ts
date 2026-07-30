import { listConnections } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';

export const isSlackTeamClaimedByAnotherConnection = async (
  teamId: string,
): Promise<boolean> => {
  const connections = await listConnections({ providerName: 'slack' });

  const claimedTeamIds = await Promise.all(
    connections.map((connection) =>
      getSlackConnectedAccountTeam(connection.id),
    ),
  );

  return claimedTeamIds.includes(teamId);
};
