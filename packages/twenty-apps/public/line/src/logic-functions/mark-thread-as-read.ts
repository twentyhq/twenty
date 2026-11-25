import { isObject, isUndefined } from '@sniptt/guards';
import { defineLogicFunction } from 'twenty-sdk/define';
import { type MarkAppThreadAsReadPayload } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINE_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { findBotMessageChannelOrThrow } from 'src/logic-functions/data/find-bot-message-channel-or-throw.util';
import { getLineAccessTokenOrThrow } from 'src/logic-functions/data/get-line-access-token-or-throw.util';
import { LineApiError } from 'src/logic-functions/data/line-api.error';
import { lineApiRequest } from 'src/logic-functions/data/line-api-request.util';
import {
  findMarkAsReadToken,
  forgetMarkAsReadToken,
} from 'src/logic-functions/data/mark-as-read-token.util';
import { withConnectionAuthFailureReport } from 'src/logic-functions/data/with-connection-auth-failure-report.util';

const INVALID_TOKEN_STATUS = 400;

const isMarkAsReadResponse = (body: unknown): body is object | undefined =>
  isUndefined(body) || isObject(body);

// https://developers.line.biz/en/docs/messaging-api/mark-as-read/
const handler = async ({
  connectedAccountId,
  messageChannelId,
  threadExternalId: chatId,
}: MarkAppThreadAsReadPayload): Promise<void> => {
  const { handle: botUserId } = await findBotMessageChannelOrThrow({
    connectedAccountId,
    messageChannelId,
  });
  const storedToken = await findMarkAsReadToken({ botUserId, chatId });

  if (!isDefined(storedToken)) {
    return;
  }

  const accessToken = await getLineAccessTokenOrThrow(connectedAccountId);

  try {
    await withConnectionAuthFailureReport(connectedAccountId, () =>
      lineApiRequest({
        accessToken,
        method: 'POST',
        path: '/v2/bot/chat/markAsRead',
        data: { markAsReadToken: storedToken.token },
        isExpectedResponse: isMarkAsReadResponse,
      }),
    );
  } catch (error) {
    // a token LINE refuses, such as one from a bot connected before, will never be accepted
    if (
      !(error instanceof LineApiError) ||
      error.status !== INVALID_TOKEN_STATUS
    ) {
      throw error;
    }

    console.warn(`LINE did not mark the chat as read: ${error.message}`);
  }

  await forgetMarkAsReadToken({ botUserId, chatId, token: storedToken.token });
};

export default defineLogicFunction({
  universalIdentifier:
    LINE_LOGIC_FUNCTION_MARK_THREAD_AS_READ_UNIVERSAL_IDENTIFIER,
  name: 'mark-thread-as-read',
  description:
    'Marks a LINE chat opened in Twenty as read, so the customer sees their messages were read',
  timeoutSeconds: 15,
  handler,
});
