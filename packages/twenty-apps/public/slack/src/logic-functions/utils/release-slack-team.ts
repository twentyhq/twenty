import { isNonEmptyString } from '@sniptt/guards';

import { getSlackConnectedAccountTeam } from 'src/logic-functions/utils/get-slack-connected-account-team';
import {
  releaseSlackTeamClaim,
  type ReleaseSlackTeamResult,
} from 'src/logic-functions/utils/release-slack-team-claim';

type ReleaseSlackTeamArgs = {
  connectedAccountId: string;
};

export const releaseSlackTeam = async ({
  connectedAccountId,
}: ReleaseSlackTeamArgs): Promise<ReleaseSlackTeamResult> => {
  if (!isNonEmptyString(connectedAccountId)) {
    throw new Error(
      'Slack team release failed: payload is missing connectedAccountId',
    );
  }

  const teamId = await getSlackConnectedAccountTeam(connectedAccountId);

  return releaseSlackTeamClaim({ connectedAccountId, teamId });
};
