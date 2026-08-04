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

  // The disconnecting connection is normally deleted before its hook runs, but
  // excluding it here keeps the answer right whatever the platform's ordering:
  // matching itself would strand the claim with nothing left to release it.
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
