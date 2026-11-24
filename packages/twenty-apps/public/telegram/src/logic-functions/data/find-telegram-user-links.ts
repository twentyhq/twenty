import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_USER_LINKS_PAGE_SIZE } from 'src/logic-functions/constants/telegram-user-links-page-size';
import { type TelegramUserLink } from 'src/logic-functions/types/telegram-user-link.type';

type TelegramUserLinkFilter = {
  id?: string;
  telegramUserId?: string;
  workspaceMemberId?: string;
};

export const findTelegramUserLinks = async ({
  client,
  filter = {},
}: {
  client: Pick<CoreApiClient, 'query'>;
  filter?: TelegramUserLinkFilter;
}): Promise<TelegramUserLink[]> => {
  const links: TelegramUserLink[] = [];
  let after: string | undefined;

  do {
    const queryResult = await client.query({
      telegramUserLinks: {
        __args: {
          filter: Object.fromEntries(
            Object.entries(filter)
              .filter(([, value]) => isNonEmptyString(value))
              .map(([field, value]) => [field, { eq: value }]),
          ),
          first: TELEGRAM_USER_LINKS_PAGE_SIZE,
          ...(isNonEmptyString(after) ? { after } : {}),
        },
        edges: {
          node: { id: true, telegramUserId: true, workspaceMemberId: true },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    const connection = queryResult.telegramUserLinks;

    for (const edge of connection?.edges ?? []) {
      if (isNonEmptyString(edge?.node?.id)) {
        links.push({
          id: edge.node.id,
          telegramUserId: isNonEmptyString(edge.node.telegramUserId)
            ? edge.node.telegramUserId
            : undefined,
          workspaceMemberId: isNonEmptyString(edge.node.workspaceMemberId)
            ? edge.node.workspaceMemberId
            : undefined,
        });
      }
    }

    after =
      connection?.pageInfo?.hasNextPage === true &&
      isNonEmptyString(connection.pageInfo.endCursor)
        ? connection.pageInfo.endCursor
        : undefined;
  } while (isNonEmptyString(after));

  return links;
};
