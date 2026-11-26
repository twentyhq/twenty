import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { type LogicFunctionExecutionContext } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_REMOVE_USER_LINK_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TELEGRAM_USER_LINKS_REMOVE_ROUTE_PATH } from 'src/logic-functions/constants/telegram-user-links-route-path';
import { destroyTelegramUserLink } from 'src/logic-functions/data/destroy-telegram-user-link';
import { findTelegramUserLinks } from 'src/logic-functions/data/find-telegram-user-links';
import { type TelegramUserLinkActionResult } from 'src/logic-functions/types/telegram-user-link-action-result.type';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { releaseTelegramUserClaim } from 'src/logic-functions/utils/release-telegram-user-claim';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message';

export const telegramRemoveUserLinkHandler = async (
  payload: Pick<RoutePayload<{ id?: unknown }>, 'body'>,
  {
    workspaceMemberId,
  }: Pick<LogicFunctionExecutionContext, 'workspaceMemberId'>,
): Promise<TelegramUserLinkActionResult> => {
  const id = payload.body?.id;

  if (!isNonEmptyString(id) && !isNonEmptyString(workspaceMemberId)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'id is required when no workspace member is calling.',
    };
  }

  try {
    const client = new CoreApiClient({ runAs: 'application' });
    const links = await findTelegramUserLinks({
      client,
      filter: isNonEmptyString(id)
        ? { id }
        : { workspaceMemberId: workspaceMemberId ?? undefined },
    });

    if (!isNonEmptyArray(links)) {
      return { success: true, message: 'No Telegram account was connected.' };
    }

    const isRemovingOnlyOwnLinks =
      isNonEmptyString(workspaceMemberId) &&
      links.every((link) => link.workspaceMemberId === workspaceMemberId);

    if (!isRemovingOnlyOwnLinks && !(await currentUserHasRolesPermission())) {
      return {
        success: false,
        message: 'Not allowed',
        error:
          'Only members with the roles permission can disconnect the Telegram account of another member.',
      };
    }

    for (const link of links) {
      await destroyTelegramUserLink({ client, id: link.id });

      if (isDefined(link.telegramUserId)) {
        await releaseTelegramUserClaim(link.telegramUserId);
      }
    }
  } catch (error) {
    return {
      success: false,
      message: 'Could not disconnect Telegram',
      error: toErrorMessage(error),
    };
  }

  return { success: true, message: 'Disconnected the Telegram account.' };
};

export default defineLogicFunction({
  universalIdentifier: TELEGRAM_REMOVE_USER_LINK_UNIVERSAL_IDENTIFIER,
  name: 'telegram-remove-user-link',
  description:
    'Disconnects a Telegram account from a workspace member and releases it so it can be connected again. Without an id it disconnects the accounts of the calling member. Disconnecting the account of another member is restricted to members with the roles permission.',
  timeoutSeconds: 30,
  httpRouteTriggerSettings: {
    path: TELEGRAM_USER_LINKS_REMOVE_ROUTE_PATH,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  handler: telegramRemoveUserLinkHandler,
});
