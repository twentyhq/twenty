import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { WHATSAPP_CHAT_OPTIONS_MAX_COUNT } from 'src/constants/whatsapp-chat-options-max-count.constant';
import { WHATSAPP_CHAT_OPTIONS_PAGE_SIZE } from 'src/constants/whatsapp-chat-options-page-size.constant';
import { WHATSAPP_SETTINGS_ROUTE_PATHS } from 'src/constants/whatsapp-settings-route-paths.constant';
import { WHATSAPP_LIST_CHATS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildWhatsappChatOptions } from 'src/logic-functions/utils/build-whatsapp-chat-options.util';
import { findOwnWhatsappConnection } from 'src/logic-functions/utils/find-own-whatsapp-connection.util';
import { type WhatsappChatOptionsPage } from 'src/types/whatsapp-chat-options-page.type';
import { listMostRecentUnipileChats } from 'src/unipile/utils/list-most-recent-unipile-chats.util';

const WHATSAPP_LIST_CHATS_TIMEOUT_SECONDS = 30;

const WHATSAPP_LIST_CHATS_DEADLINE_MARGIN_MILLISECONDS = 10 * 1000;

const getRequestedChatCount = (limit: unknown): number =>
  isNumber(limit) && Number.isInteger(limit) && limit > 0
    ? Math.min(limit, WHATSAPP_CHAT_OPTIONS_MAX_COUNT)
    : WHATSAPP_CHAT_OPTIONS_PAGE_SIZE;

export const whatsappListChatsHandler = async (
  routePayload: Pick<RoutePayload<Record<string, unknown>>, 'body'>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<WhatsappChatOptionsPage> => {
  const connection = await findOwnWhatsappConnection(context);
  const unipileAccountId = connection?.externalAccountId;

  if (!isDefined(connection) || !isNonEmptyString(unipileAccountId)) {
    throw new Error('Connect your WhatsApp account first.');
  }

  const limit = getRequestedChatCount(routePayload.body?.limit);
  const chats = await listMostRecentUnipileChats({
    accountId: unipileAccountId,
    limit,
    deadlineAtMs:
      Date.now() +
      WHATSAPP_LIST_CHATS_TIMEOUT_SECONDS * 1000 -
      WHATSAPP_LIST_CHATS_DEADLINE_MARGIN_MILLISECONDS,
  });

  return {
    chats: buildWhatsappChatOptions(chats),
    hasMore: chats.length === limit && limit < WHATSAPP_CHAT_OPTIONS_MAX_COUNT,
  };
};

export default defineLogicFunction({
  universalIdentifier: WHATSAPP_LIST_CHATS_UNIVERSAL_IDENTIFIER,
  name: 'whatsapp-list-chats',
  description:
    'Lists the most recent WhatsApp conversations of the requesting member connection, for them to pick the ones to import.',
  timeoutSeconds: WHATSAPP_LIST_CHATS_TIMEOUT_SECONDS,
  handler: whatsappListChatsHandler,
  httpRouteTriggerSettings: {
    path: WHATSAPP_SETTINGS_ROUTE_PATHS.listChats,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
