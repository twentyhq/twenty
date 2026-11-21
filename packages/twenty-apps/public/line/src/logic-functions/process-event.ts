import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_LOGIC_FUNCTION_PROCESS_EVENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { applyMessageEdit } from 'src/logic-functions/data/apply-message-edit.util';
import { applyUnsend } from 'src/logic-functions/data/apply-unsend.util';
import { fetchLineChatName } from 'src/logic-functions/data/fetch-line-chat-name.util';
import { findBotMessageChannelOrThrow } from 'src/logic-functions/data/find-bot-message-channel-or-throw.util';
import { getLineAccessTokenOrThrow } from 'src/logic-functions/data/get-line-access-token-or-throw.util';
import { getLineChatId } from 'src/logic-functions/data/get-line-chat-id.util';
import { importMessage } from 'src/logic-functions/data/import-message.util';
import { findConnectedAccountIdByBotUserId } from 'src/logic-functions/data/link-bot-to-connection.util';
import { storeMarkAsReadToken } from 'src/logic-functions/data/mark-as-read-token.util';
import { resolveLineSender } from 'src/logic-functions/data/resolve-line-sender.util';
import {
  forgetUnsentMessage,
  isMessageUnsent,
} from 'src/logic-functions/data/unsent-message-marker.util';
import { withConnectionAuthFailureReport } from 'src/logic-functions/data/with-connection-auth-failure-report.util';
import { type ProcessEventPayload } from 'src/logic-functions/types/process-event-payload.type';

const handler = async ({ botUserId, event }: ProcessEventPayload) => {
  const connectedAccountId = await findConnectedAccountIdByBotUserId(botUserId);

  if (!isDefined(connectedAccountId)) {
    console.warn(`Ignoring LINE event, bot ${botUserId} is no longer connected`);

    return;
  }

  const client = new CoreApiClient();
  const messageChannel = await findBotMessageChannelOrThrow({
    connectedAccountId,
    botUserId,
  });

  if (event.type === 'unsend') {
    await applyUnsend({
      client,
      messageChannelId: messageChannel.id,
      messageId: event.unsend.messageId,
    });

    return;
  }

  if (event.type === 'messageEdited') {
    if (event.message.type === 'text') {
      await applyMessageEdit({
        client,
        messageChannelId: messageChannel.id,
        messageId: event.message.id,
        text: event.message.text,
      });
    }

    return;
  }

  if (await isMessageUnsent(messageChannel.id, event.message.id)) {
    await forgetUnsentMessage(messageChannel.id, event.message.id);

    return;
  }

  const accessToken = await getLineAccessTokenOrThrow(connectedAccountId);
  const chatId = getLineChatId(event.source);

  await withConnectionAuthFailureReport(connectedAccountId, async () => {
    await importMessage({
      accessToken,
      messageChannelId: messageChannel.id,
      botUserId,
      chatId,
      chatName: await fetchLineChatName({ accessToken, source: event.source }),
      sender: await resolveLineSender({
        client,
        accessToken,
        botUserId,
        source: event.source,
      }),
      message: event.message,
      receivedAt: new Date(event.timestamp),
    });
  });

  if (await isMessageUnsent(messageChannel.id, event.message.id)) {
    await applyUnsend({
      client,
      messageChannelId: messageChannel.id,
      messageId: event.message.id,
    });

    return;
  }

  if (isNonEmptyString(event.message.markAsReadToken)) {
    await storeMarkAsReadToken({
      botUserId,
      chatId,
      token: event.message.markAsReadToken,
      timestamp: event.timestamp,
    });
  }
};

export default defineLogicFunction({
  universalIdentifier: LINE_LOGIC_FUNCTION_PROCESS_EVENT_UNIVERSAL_IDENTIFIER,
  name: 'process-event',
  description:
    'Processes one LINE event from a one-on-one or group chat: imports a message and links its sender to a Person, applies an edit, or removes a message the sender unsent',
  timeoutSeconds: 60,
  handler,
});
