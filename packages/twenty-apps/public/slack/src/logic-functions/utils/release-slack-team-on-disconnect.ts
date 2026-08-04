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

  if (
    isNonEmptyString(teamId) &&
    (await isSlackTeamClaimedByAnotherConnection(teamId))
  ) {
    await kv.delete(getSlackConnectedAccountTeamKvKey(connectedAccountId));

    return { ok: true, releasedTeamId: null };
  }

  return releaseSlackTeam({ connectedAccountId });
};
