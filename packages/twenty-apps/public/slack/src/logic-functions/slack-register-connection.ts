import { defineLogicFunction } from 'twenty-sdk/define';

import { SLACK_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { slackRegisterConnectionHandler } from 'src/logic-functions/handlers/slack-register-connection-handler';

export default defineLogicFunction({
  universalIdentifier: SLACK_REGISTER_CONNECTION_UNIVERSAL_IDENTIFIER,
  name: 'slack-register-connection',
  description:
    'Runs when a Slack connection is established (via the connection provider onConnect hook). Resolves the Slack team_id for the just-created connection via auth.test and stores this workspace id under the server-scoped slack-team:<team_id> key so inbound Slack events route here. Caches the bot user id from the same auth.test under slack-bot-user-id so the channel welcome can recognise the bot without calling Slack on every join event.',
  timeoutSeconds: 30,
  handler: slackRegisterConnectionHandler,
});
