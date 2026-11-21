import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_LOGIC_FUNCTION_PROCESS_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { fetchLineUserDisplayName } from 'src/logic-functions/data/fetch-line-user-display-name.util';
import { findBotMessageChannelOrThrow } from 'src/logic-functions/data/find-bot-message-channel-or-throw.util';
import { findOrCreateLinePersonId } from 'src/logic-functions/data/find-or-create-line-person-id.util';
import { getLineAccessTokenOrThrow } from 'src/logic-functions/data/get-line-access-token-or-throw.util';
import { importMessage } from 'src/logic-functions/data/import-message.util';
import { findConnectedAccountIdByBotUserId } from 'src/logic-functions/data/link-bot-to-connection.util';
import { withConnectionAuthFailureReport } from 'src/logic-functions/data/with-connection-auth-failure-report.util';
import { type ProcessEventPayload } from 'src/logic-functions/types/process-event-payload.type';

const handler = async ({ botUserId, event }: ProcessEventPayload) => {
  const connectedAccountId = await findConnectedAccountIdByBotUserId(botUserId);

  if (!isDefined(connectedAccountId)) {
    console.warn(`Ignoring LINE event, bot ${botUserId} is no longer connected`);

    return;
  }

  const messageChannel = await findBotMessageChannelOrThrow({
    connectedAccountId,
    botUserId,
  });
  const accessToken = await getLineAccessTokenOrThrow(connectedAccountId);
  const { userId } = event.source;

  await withConnectionAuthFailureReport(connectedAccountId, async () => {
    const personId = await findOrCreateLinePersonId({
      client: new CoreApiClient(),
      botUserId,
      userId,
      resolveDisplayName: () =>
        fetchLineUserDisplayName({ accessToken, userId }),
    });

    await importMessage({
      messageChannelId: messageChannel.id,
      botUserId,
      userId,
      personId,
      message: event.message,
      receivedAt: new Date(event.timestamp),
    });
  });
};

export default defineLogicFunction({
  universalIdentifier: LINE_LOGIC_FUNCTION_PROCESS_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'process-event',
  description:
    'Processes one LINE event: imports a message into its thread and links the sender to a Person',
  timeoutSeconds: 60,
  handler,
});
