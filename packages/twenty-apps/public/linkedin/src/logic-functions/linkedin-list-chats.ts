import { isNonEmptyString, isNumber } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_CHAT_OPTIONS_MAX_COUNT } from 'src/constants/linkedin-chat-options-max-count.constant';
import { LINKEDIN_CHAT_OPTIONS_PAGE_SIZE } from 'src/constants/linkedin-chat-options-page-size.constant';
import { LINKEDIN_SETTINGS_ROUTE_PATHS } from 'src/constants/linkedin-settings-route-paths.constant';
import { LINKEDIN_LIST_CHATS_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { buildLinkedinChatOption } from 'src/logic-functions/utils/build-linkedin-chat-option.util';
import { findOwnLinkedinConnection } from 'src/logic-functions/utils/find-own-linkedin-connection.util';
import { type LinkedinChatOptionsPage } from 'src/types/linkedin-chat-options-page.type';
import { listMostRecentUnipileChats } from 'src/unipile/utils/list-most-recent-unipile-chats.util';
import { listUnipileInboxIds } from 'src/unipile/utils/list-unipile-inbox-ids.util';

const LINKEDIN_LIST_CHATS_TIMEOUT_SECONDS = 30;

const LINKEDIN_LIST_CHATS_DEADLINE_MARGIN_MILLISECONDS = 10 * 1000;

const getRequestedChatCount = (limit: unknown): number =>
  isNumber(limit) && Number.isInteger(limit) && limit > 0
    ? Math.min(limit, LINKEDIN_CHAT_OPTIONS_MAX_COUNT)
    : LINKEDIN_CHAT_OPTIONS_PAGE_SIZE;

export const linkedinListChatsHandler = async (
  routePayload: Pick<RoutePayload<Record<string, unknown>>, 'body'>,
  context: Pick<LogicFunctionExecutionContext, 'userWorkspaceId'>,
): Promise<LinkedinChatOptionsPage> => {
  const connection = await findOwnLinkedinConnection(context);
  const unipileAccountId = connection?.externalAccountId;

  if (!isDefined(connection) || !isNonEmptyString(unipileAccountId)) {
    throw new Error('Connect your LinkedIn account first.');
  }

  const limit = getRequestedChatCount(routePayload.body?.limit);
  const chats = await listMostRecentUnipileChats({
    accountId: unipileAccountId,
    inboxIds: await listUnipileInboxIds(unipileAccountId),
    limit,
    deadlineAtMs:
      Date.now() +
      LINKEDIN_LIST_CHATS_TIMEOUT_SECONDS * 1000 -
      LINKEDIN_LIST_CHATS_DEADLINE_MARGIN_MILLISECONDS,
  });

  return {
    chats: chats.map(buildLinkedinChatOption),
    hasMore: chats.length === limit && limit < LINKEDIN_CHAT_OPTIONS_MAX_COUNT,
  };
};

export default defineLogicFunction({
  universalIdentifier: LINKEDIN_LIST_CHATS_UNIVERSAL_IDENTIFIER,
  name: 'linkedin-list-chats',
  description:
    'Lists the most recent LinkedIn conversations of the requesting member connection, for them to pick the ones to import.',
  timeoutSeconds: LINKEDIN_LIST_CHATS_TIMEOUT_SECONDS,
  handler: linkedinListChatsHandler,
  httpRouteTriggerSettings: {
    path: LINKEDIN_SETTINGS_ROUTE_PATHS.listChats,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
