import { isNonEmptyString } from '@sniptt/guards';
import { kv } from 'twenty-sdk/logic-function';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { getSlackConnectedAccountTeamKvKey } from 'src/logic-functions/utils/get-slack-connected-account-team-kv-key';
import { isSlackTeamClaimedByAnotherConnection } from 'src/logic-functions/utils/is-slack-team-claimed-by-another-connection';
import {
  releaseSlackTeam,
  type ReleaseSlackTeamResult,
} from 'src/logic-functions/utils/release-slack-team';

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

  // The disconnected connection is already deleted by the time the hook runs,
  // so anything still listed against the same team is live: a reconnect that
  // re-claimed it while this job was queued, or a second connection to the
  // same Slack workspace. The claim is theirs now.
  if (
    isNonEmptyString(teamId) &&
    (await isSlackTeamClaimedByAnotherConnection(teamId))
  ) {
    await kv.delete(getSlackConnectedAccountTeamKvKey(connectedAccountId));

    return { ok: true, releasedTeamId: null };
  }

  return releaseSlackTeam({ connectedAccountId });
};
