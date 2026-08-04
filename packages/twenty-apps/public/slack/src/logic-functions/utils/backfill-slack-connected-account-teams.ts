import { isNonEmptyString } from '@sniptt/guards';
import { kv, listConnections } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { resolveSlackTeamId } from 'src/logic-functions/utils/resolve-slack-team-id';

type BackfillSlackConnectedAccountTeamsResult = {
  ok: true;
  backfilledConnectedAccountIds: string[];
  failedConnectedAccountIds: string[];
};

// Connections claimed before the app recorded a connected account to team
// mapping have a server claim nothing can resolve, and disconnect cannot ask
// Slack because the token is gone by then. Running on every upgrade closes that
// gap while the tokens are still there.
export const backfillSlackConnectedAccountTeams =
  async (): Promise<BackfillSlackConnectedAccountTeamsResult> => {
    const connections = await listConnections({ providerName: 'slack' });

    const backfilledConnectedAccountIds: string[] = [];
    const failedConnectedAccountIds: string[] = [];

    for (const connection of connections) {
      // Per connection, so one unreachable account or failed read cannot stop
      // the others from being recorded.
      try {
        const recordedTeamId = await getSlackConnectedAccountTeam(
          connection.id,
        );

        if (isNonEmptyString(recordedTeamId)) {
          continue;
        }

        const teamId = await resolveSlackTeamId(connection.accessToken);

        if (!isNonEmptyString(teamId)) {
          failedConnectedAccountIds.push(connection.id);
          continue;
        }

        await kv.set(getSlackConnectedAccountTeamKvKey(connection.id), teamId);

        backfilledConnectedAccountIds.push(connection.id);
      } catch {
        failedConnectedAccountIds.push(connection.id);
      }
    }

    return {
      ok: true,
      backfilledConnectedAccountIds,
      failedConnectedAccountIds,
    };
  };
