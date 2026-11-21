import { defineLogicFunction } from 'twenty-sdk/define';

import { LINE_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { unlinkBotFromConnection } from 'src/logic-functions/data/link-bot-to-connection.util';

const handler = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}) => {
  await unlinkBotFromConnection(connectedAccountId);
};

export default defineLogicFunction({
  universalIdentifier: LINE_LOGIC_FUNCTION_ON_DISCONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-disconnect',
  description:
    'Stops accepting webhooks for the Official Account of a disconnected account',
  timeoutSeconds: 15,
  handler,
});
