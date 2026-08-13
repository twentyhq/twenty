import { kv, listConnections } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

type ReleaseSlackTeamOnInstallRevokedArgs = {
  teamId: string;
};

type ReleaseSlackTeamOnInstallRevokedResult = {
  ok: true;
  releasedTeamId: string | null;
  releasedConnectedAccountIds: string[];
};

export const releaseSlackTeamOnInstallRevoked = async ({
  teamId,
}: ReleaseSlackTeamOnInstallRevokedArgs): Promise<ReleaseSlackTeamOnInstallRevokedResult> => {
  // A SERVER-scoped delete is a no-op unless this workspace still holds the claim,
  // so a team reclaimed by another workspace in the meantime is left untouched.
  const hasReleasedTeam = await kv.delete(getSlackTeamKvKey(teamId), {
    scope: 'SERVER',
  });

  const connections = await listConnections({ providerName: 'slack' });

  const connectedAccountTeams = await Promise.all(
    connections.map(async (connection) => ({
      connectedAccountId: connection.id,
      teamId: await getSlackConnectedAccountTeam(connection.id),
    })),
  );

  const releasedConnectedAccountIds = connectedAccountTeams
    .filter((connectedAccountTeam) => connectedAccountTeam.teamId === teamId)
    .map((connectedAccountTeam) => connectedAccountTeam.connectedAccountId);

  await Promise.all(
    releasedConnectedAccountIds.map((connectedAccountId) =>
      kv.delete(getSlackConnectedAccountTeamKvKey(connectedAccountId)),
    ),
  );

  return {
    ok: true,
    releasedTeamId: hasReleasedTeam ? teamId : null,
    releasedConnectedAccountIds,
  };
};
