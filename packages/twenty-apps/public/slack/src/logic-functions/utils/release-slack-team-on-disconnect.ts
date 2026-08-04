import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { isSlackTeamClaimedByAnotherConnection } from 'src/logic-functions/utils/is-slack-team-claimed-by-another-connection';
import {
  releaseSlackTeamClaim,
  type ReleaseSlackTeamResult,
} from 'src/logic-functions/utils/release-slack-team-claim';

type ReleaseSlackTeamOnDisconnectArgs = {
  connectedAccountId: string;
};

export const releaseSlackTeamOnDisconnect = async ({
  connectedAccountId,
}: ReleaseSlackTeamOnDisconnectArgs): Promise<ReleaseSlackTeamResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    throw new Error(
      'Slack team release failed: onDisconnect payload is missing connectedAccountId',
    );
  }

  const teamId = await getSlackConnectedAccountTeam(connectedAccountId);

  if (isNonEmptyString(teamId)) {
    const isClaimedByAnotherConnection =
      await isSlackTeamClaimedByAnotherConnection({
        teamId,
        excludedConnectedAccountId: connectedAccountId,
      });

    // A reconnect that re-claimed the team while this job was queued, or a
    // second connection to the same Slack workspace, owns the claim now.
    if (isClaimedByAnotherConnection) {
      await kv.delete(getSlackConnectedAccountTeamKvKey(connectedAccountId));

      return { ok: true, releasedTeamId: null };
    }
  }

  return releaseSlackTeamClaim({ connectedAccountId, teamId });
};
