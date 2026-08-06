import { isNonEmptyString } from '@sniptt/guards';
import { listConnections } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { releaseSlackTeamClaim } from 'src/logic-functions/utils/release-slack-team-claim';

type ReleaseAllSlackTeamsResult = {
  ok: true;
  releasedTeamIds: string[];
};

export const releaseAllSlackTeams =
  async (): Promise<ReleaseAllSlackTeamsResult> => {
    const connections = await listConnections({ providerName: 'slack' });

    const results = await Promise.all(
      connections.map(async (connection) =>
        releaseSlackTeamClaim({
          connectedAccountId: connection.id,
          teamId: await getSlackConnectedAccountTeam(connection.id),
        }),
      ),
    );

    return {
      ok: true,
      releasedTeamIds: results
        .map((result) => result.releasedTeamId)
        .filter((teamId): teamId is string => isNonEmptyString(teamId)),
    };
  };
