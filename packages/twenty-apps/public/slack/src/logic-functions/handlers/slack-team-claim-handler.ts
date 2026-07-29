import { type SlackTeamClaimPayload } from 'src/logic-functions/types/slack-team-claim-payload.type';
import { claimSlackTeam } from 'src/logic-functions/utils/claim-slack-team';

export const slackTeamClaimHandler = (payload: SlackTeamClaimPayload) =>
  claimSlackTeam({
    connectedAccountId: payload.connectedAccountId,
  });
