import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_USER_LINKS_PAGE_SIZE } from 'src/logic-functions/constants/telegram-user-links-page-size';
import { collectConnectionNodesOrThrow } from 'src/logic-functions/data/collect-connection-nodes-or-throw';
import { type TelegramUserLink } from 'src/logic-functions/types/telegram-user-link.type';

type TelegramUserLinkFilter = {
  id?: string;
  telegramUserId?: string;
  workspaceMemberId?: string;
};

type TelegramUserLinkNode = {
  id?: string | null;
  telegramUserId?: string | null;
  workspaceMemberId?: string | null;
};

export const findTelegramUserLinks = async ({
  client,
  filter = {},
}: {
  client: Pick<CoreApiClient, 'query'>;
  filter?: TelegramUserLinkFilter;
}): Promise<TelegramUserLink[]> => {
  const recordFilter = Object.fromEntries(
    Object.entries(filter)
      .filter(([, value]) => isDefined(value))
      .map(([field, value]) => [field, { eq: value }]),
  );

  const nodes = await collectConnectionNodesOrThrow<TelegramUserLinkNode>({
    fetchPage: async (after) =>
      (
        await client.query({
          telegramUserLinks: {
            __args: {
              filter: recordFilter,
              first: TELEGRAM_USER_LINKS_PAGE_SIZE,
              ...(isNonEmptyString(after) ? { after } : {}),
            },
            edges: {
              node: { id: true, telegramUserId: true, workspaceMemberId: true },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        })
      ).telegramUserLinks,
  });

  return nodes.flatMap((node) =>
    isNonEmptyString(node.id)
      ? [
          {
            id: node.id,
            telegramUserId: isNonEmptyString(node.telegramUserId)
              ? node.telegramUserId
              : undefined,
            workspaceMemberId: isNonEmptyString(node.workspaceMemberId)
              ? node.workspaceMemberId
              : undefined,
          },
        ]
      : [],
  );
};
