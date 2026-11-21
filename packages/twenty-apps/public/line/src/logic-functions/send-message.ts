import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import {
  type SendAppMessagePayload,
  type SendAppMessageResult,
} from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_PUSH_LIMITS } from 'src/constants/line-push-limits.constant';
import { LINE_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildRetryKey } from 'src/logic-functions/data/build-retry-key.util';
import { chunkArray } from 'src/logic-functions/data/chunk-array.util';
import { findBotMessageChannelOrThrow } from 'src/logic-functions/data/find-bot-message-channel-or-throw.util';
import { getLineAccessTokenOrThrow } from 'src/logic-functions/data/get-line-access-token-or-throw.util';
import { pushLineMessages } from 'src/logic-functions/data/push-line-messages.util';
import { splitOutgoingText } from 'src/logic-functions/data/split-outgoing-text.util';
import { withConnectionAuthFailureReport } from 'src/logic-functions/data/with-connection-auth-failure-report.util';

// replies are push messages: the free reply token expires a minute after the customer's message
const handler = async ({
  connectedAccountId,
  messageChannelId,
  threadExternalId,
  text,
  attachments,
  idempotencyKey,
}: SendAppMessagePayload): Promise<SendAppMessageResult> => {
  if (attachments.length > 0) {
    throw new Error(
      'LINE replies from Twenty cannot carry attachments yet. Send the text alone.',
    );
  }

  if (!isNonEmptyString(text.trim())) {
    throw new Error('A LINE reply needs some text.');
  }

  await findBotMessageChannelOrThrow({ connectedAccountId, messageChannelId });

  const accessToken = await getLineAccessTokenOrThrow(connectedAccountId);
  const requests = chunkArray(
    splitOutgoingText(text),
    LINE_PUSH_LIMITS.messagesPerRequest,
  );
  const sentMessageIds: string[] = [];

  await withConnectionAuthFailureReport(connectedAccountId, async () => {
    for (const [requestIndex, texts] of requests.entries()) {
      sentMessageIds.push(
        ...(await pushLineMessages({
          accessToken,
          to: threadExternalId,
          texts,
          retryKey: buildRetryKey(`${idempotencyKey}:${requestIndex}`),
        })),
      );
    }
  });

  const [firstSentMessageId] = sentMessageIds;

  if (!isDefined(firstSentMessageId)) {
    throw new Error('LINE accepted the reply but returned no message id');
  }

  return { externalId: firstSentMessageId, sentAt: new Date().toISOString() };
};

export default defineLogicFunction({
  universalIdentifier: LINE_LOGIC_FUNCTION_SEND_MESSAGE_UNIVERSAL_IDENTIFIER,
  name: 'send-message',
  description:
    'Sends a reply written in Twenty to its LINE chat as a push message',
  timeoutSeconds: 30,
  handler,
});
