import { defineLogicFunction } from 'twenty-sdk/define';

import { LINE_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { fetchLineBotInfo } from 'src/logic-functions/data/fetch-line-bot-info.util';
import { getLineAccessTokenOrThrow } from 'src/logic-functions/data/get-line-access-token-or-throw.util';
import { linkBotToConnection } from 'src/logic-functions/data/link-bot-to-connection.util';
import { syncBotMessageChannel } from 'src/logic-functions/data/sync-bot-message-channel.util';

const handler = async ({
  connectedAccountId,
}: {
  connectedAccountId: string;
}) => {
  const botInfo = await fetchLineBotInfo(
    await getLineAccessTokenOrThrow(connectedAccountId),
  );

  await linkBotToConnection({ connectedAccountId, botUserId: botInfo.userId });
  await syncBotMessageChannel({ connectedAccountId, botInfo });
};

export default defineLogicFunction({
  universalIdentifier: LINE_LOGIC_FUNCTION_ON_CONNECT_UNIVERSAL_IDENTIFIER,
  name: 'on-connect',
  description:
    'Links the Official Account to the connection so its webhooks are accepted, and creates its message channel',
  timeoutSeconds: 30,
  handler,
});
