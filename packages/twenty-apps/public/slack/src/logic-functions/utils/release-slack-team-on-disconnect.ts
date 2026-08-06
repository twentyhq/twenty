import { isNonEmptyString } from '@sniptt/guards';

import { type ReleaseSlackTeamResult } from 'src/logic-functions/types/release-slack-team-result.type';
import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import { isSlackTeamClaimedByAnotherConnection } from 'src/logic-functions/utils/is-slack-team-claimed-by-another-connection';
import { releaseSlackTeamClaim } from 'src/logic-functions/utils/release-slack-team-claim';

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

  const isClaimedByAnotherConnection =
    isNonEmptyString(teamId) &&
    (await isSlackTeamClaimedByAnotherConnection({
      teamId,
      excludedConnectedAccountId: connectedAccountId,
    }));

  return releaseSlackTeamClaim({
    connectedAccountId,
    teamId: isClaimedByAnotherConnection ? null : teamId,
  });
};
