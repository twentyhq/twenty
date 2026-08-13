import { isNonEmptyString } from '@sniptt/guards';
import { kv, listConnections } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

type ReleaseSlackTeamOnInstallRevokedResult = {
  ok: true;
  releasedTeamId: string | null;
  releasedConnectedAccountIds: string[];
};

export const releaseSlackTeamOnInstallRevoked = async (
  teamId: string,
): Promise<ReleaseSlackTeamOnInstallRevokedResult> => {
  const connections = await listConnections({ providerName: 'slack' });

  const releasedConnectedAccountIds = (
    await Promise.all(
      connections.map(async (connection) => {
        const connectionTeamId = await getSlackConnectedAccountTeam(
          connection.id,
        );

        if (connectionTeamId !== teamId) {
          return null;
        }

        await kv.delete(getSlackConnectedAccountTeamKvKey(connection.id));

        return connection.id;
      }),
    )
  ).filter((connectedAccountId): connectedAccountId is string =>
    isNonEmptyString(connectedAccountId),
  );

  // The claim can outlive its connections, so release it by team id rather
  // than through them; this workspace was resolved from that claim, so it is
  // ours to delete.
  const hasReleasedTeam = await kv.delete(getSlackTeamKvKey(teamId), {
    scope: 'SERVER',
  });

  return {
    ok: true,
    releasedTeamId: hasReleasedTeam ? teamId : null,
    releasedConnectedAccountIds,
  };
};
