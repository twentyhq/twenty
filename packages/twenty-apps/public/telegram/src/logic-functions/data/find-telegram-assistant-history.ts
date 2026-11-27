import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_ASSISTANT_FAILURE_TEXT } from 'src/logic-functions/constants/telegram-assistant-failure-text';
import { TELEGRAM_ASSISTANT_HISTORY_TURN_LIMIT } from 'src/logic-functions/constants/telegram-assistant-history-turn-limit';
import { TELEGRAM_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/telegram-assistant-request-status';
import { type TelegramAssistantTurn } from 'src/logic-functions/types/telegram-assistant-turn.type';

type TelegramAssistantHistoryNode = {
  status?: string | null;
  requestText?: { markdown?: string | null } | null;
  responseText?: { markdown?: string | null } | null;
};

const toTelegramAssistantTurn = (
  node: TelegramAssistantHistoryNode,
): TelegramAssistantTurn | undefined => {
  const requestText = node.requestText?.markdown;
  const responseText =
    node.status === TELEGRAM_ASSISTANT_REQUEST_STATUS.FAILED
      ? TELEGRAM_ASSISTANT_FAILURE_TEXT
      : node.responseText?.markdown;

  if (!isNonEmptyString(requestText) || !isNonEmptyString(responseText)) {
    return undefined;
  }

  return { requestText, responseText };
};

export const findTelegramAssistantHistory = async ({
  client,
  telegramChatId,
  workspaceMemberId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  telegramChatId: string;
  workspaceMemberId: string;
}): Promise<TelegramAssistantTurn[]> => {
  const queryResult = await client.query({
    telegramAssistantRequests: {
      __args: {
        filter: {
          telegramChatId: { eq: telegramChatId },
          workspaceMemberId: { eq: workspaceMemberId },
          status: {
            in: [
              TELEGRAM_ASSISTANT_REQUEST_STATUS.DONE,
              TELEGRAM_ASSISTANT_REQUEST_STATUS.FAILED,
            ],
          },
        },
        orderBy: [{ createdAt: 'DescNullsLast' }],
        first: TELEGRAM_ASSISTANT_HISTORY_TURN_LIMIT,
      },
      edges: {
        node: {
          status: true,
          requestText: { markdown: true },
          responseText: { markdown: true },
        },
      },
    },
  });

  const nodes: TelegramAssistantHistoryNode[] = (
    queryResult.telegramAssistantRequests?.edges ?? []
  ).map((edge: { node: TelegramAssistantHistoryNode }) => edge.node);

  return nodes.map(toTelegramAssistantTurn).filter(isDefined).reverse();
};
