import { listConnections } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';

type IsSlackTeamClaimedByAnotherConnectionArgs = {
  teamId: string;
  excludedConnectedAccountId: string;
};

export const isSlackTeamClaimedByAnotherConnection = async ({
  teamId,
  excludedConnectedAccountId,
}: IsSlackTeamClaimedByAnotherConnectionArgs): Promise<boolean> => {
  const connections = await listConnections({ providerName: 'slack' });

  const otherConnections = connections.filter(
    (connection) => connection.id !== excludedConnectedAccountId,
  );

  const claimedTeamIds = await Promise.all(
    otherConnections.map((connection) =>
      getSlackConnectedAccountTeam(connection.id),
    ),
  );

  return claimedTeamIds.includes(teamId);
};
