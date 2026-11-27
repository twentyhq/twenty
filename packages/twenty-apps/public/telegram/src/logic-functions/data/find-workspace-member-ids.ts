import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_USER_LINKS_PAGE_SIZE } from 'src/logic-functions/constants/telegram-user-links-page-size';
import { collectConnectionNodesOrThrow } from 'src/logic-functions/data/collect-connection-nodes-or-throw';

export const findWorkspaceMemberIds = async ({
  client,
}: {
  client: Pick<CoreApiClient, 'query'>;
}): Promise<string[]> => {
  const nodes = await collectConnectionNodesOrThrow<{ id?: string | null }>({
    fetchPage: async (after) =>
      (
        await client.query({
          workspaceMembers: {
            __args: {
              first: TELEGRAM_USER_LINKS_PAGE_SIZE,
              ...(isNonEmptyString(after) ? { after } : {}),
            },
            edges: { node: { id: true } },
            pageInfo: { hasNextPage: true, endCursor: true },
          },
        })
      ).workspaceMembers,
  });

  return nodes.map((node) => node.id).filter(isNonEmptyString);
};
