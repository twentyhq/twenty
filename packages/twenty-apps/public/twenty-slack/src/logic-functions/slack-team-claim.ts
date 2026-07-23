import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { kv } from 'twenty-sdk/logic-function';

import { SLACK_TEAM_CLAIM_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { getSlackTeamKvKey } from 'src/logic-functions/utils/get-slack-team-kv-key';

type SlackTeamClaimPayload = {
  connectionProviderId: string;
  connectionProviderName: string;
  connectedAccountId: string;
};

type SlackTeamClaimResult = {
  ok: boolean;
  teamId?: string;
};

const slackTeamClaimHandler = async (
  _payload: SlackTeamClaimPayload,
): Promise<SlackTeamClaimResult> => {
  const clientResult = await getSlackClient();

  if (!clientResult.success) {
    throw new Error(`Slack team claim failed: ${clientResult.error}`);
  }

  const authResult = await clientResult.client.auth.test();
  const teamId = authResult.team_id;

  if (!isNonEmptyString(teamId)) {
    throw new Error('Slack auth.test returned no team_id to claim');
  }

  await kv.set(getSlackTeamKvKey(teamId), true, { scope: 'SERVER' });

  return { ok: true, teamId };
};

export default defineLogicFunction({
  universalIdentifier: SLACK_TEAM_CLAIM_UNIVERSAL_IDENTIFIER,
  name: 'slack-team-claim',
  description:
    'Runs when a Slack connection is established (via the connection provider onConnect hook). Resolves the Slack team_id via auth.test and claims the server-scoped slack-team:<team_id> key for this workspace so inbound Slack events route to the right workspace.',
  timeoutSeconds: 30,
  handler: slackTeamClaimHandler,
});
