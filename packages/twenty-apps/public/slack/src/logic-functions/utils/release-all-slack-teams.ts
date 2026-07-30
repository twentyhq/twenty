import { isNonEmptyString } from '@sniptt/guards';
import { listConnections } from 'twenty-sdk/logic-function';

import { releaseSlackTeam } from 'src/logic-functions/utils/release-slack-team';

type ReleaseAllSlackTeamsResult = {
  ok: true;
  teamIds: string[];
};

export const releaseAllSlackTeams =
  async (): Promise<ReleaseAllSlackTeamsResult> => {
    const connections = await listConnections({ providerName: 'slack' });

    const results = await Promise.all(
      connections.map((connection) =>
        releaseSlackTeam({ connectedAccountId: connection.id }),
      ),
    );

    return {
      ok: true,
      teamIds: results
        .map((result) => result.teamId)
        .filter((teamId): teamId is string => isNonEmptyString(teamId)),
    };
  };
