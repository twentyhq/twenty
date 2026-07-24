import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_TEAM_CLAIM_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { claimSlackTeam } from 'src/logic-functions/utils/claim-slack-team';

type SlackTeamClaimPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  connectedAccountId: string;
};

export default defineLogicFunction({
  universalIdentifier: SLACK_TEAM_CLAIM_UNIVERSAL_IDENTIFIER,
  name: 'slack-team-claim',
  description:
    'Runs when a Slack connection is established (via the connection provider onConnect hook). Resolves the Slack team_id for the just-created connection via auth.test and stores this workspace id under the server-scoped slack-team:<team_id> key so inbound Slack events route here.',
  timeoutSeconds: 30,
  handler: async (payload: SlackTeamClaimPayload) =>
    claimSlackTeam({
      connectedAccountId: payload.connectedAccountId,
    }),
});
