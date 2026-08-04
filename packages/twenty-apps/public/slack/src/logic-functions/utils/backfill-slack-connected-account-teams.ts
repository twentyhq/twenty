import { WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { kv, listConnections } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';

type BackfillSlackConnectedAccountTeamsResult = {
  ok: true;
  backfilledConnectedAccountIds: string[];
  failedConnectedAccountIds: string[];
};

const resolveTeamId = async (accessToken: string): Promise<string | null> => {
  const authResult = await new WebClient(accessToken).auth.test();

  return isNonEmptyString(authResult.team_id) ? authResult.team_id : null;
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
      const recordedTeamId = await getSlackConnectedAccountTeam(connection.id);

      if (isNonEmptyString(recordedTeamId)) {
        continue;
      }

      try {
        const teamId = await resolveTeamId(connection.accessToken);

        if (!isNonEmptyString(teamId)) {
          failedConnectedAccountIds.push(connection.id);
          continue;
        }

        await kv.set(getSlackConnectedAccountTeamKvKey(connection.id), teamId);

        backfilledConnectedAccountIds.push(connection.id);
      } catch {
        // One unreachable or revoked connection must not stop the others.
        failedConnectedAccountIds.push(connection.id);
      }
    }

    return {
      ok: true,
      backfilledConnectedAccountIds,
      failedConnectedAccountIds,
    };
  };
