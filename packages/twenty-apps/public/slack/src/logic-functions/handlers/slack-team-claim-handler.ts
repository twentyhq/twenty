import { type SlackConnectionHookPayload } from 'src/logic-functions/types/slack-connection-hook-payload.type';
import { claimSlackTeam } from 'src/logic-functions/utils/claim-slack-team';

export const slackTeamClaimHandler = (payload: SlackConnectionHookPayload) =>
  claimSlackTeam({
    connectedAccountId: payload.connectedAccountId,
  });
