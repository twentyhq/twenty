import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TELEGRAM_USER_LINKS_PAGE_SIZE } from 'src/logic-functions/constants/telegram-user-links-page-size';

export const findWorkspaceMemberIds = async ({
  client,
}: {
  client: Pick<CoreApiClient, 'query'>;
}): Promise<string[]> => {
  const workspaceMemberIds: string[] = [];
  let after: string | undefined;

  do {
    const queryResult = await client.query({
      workspaceMembers: {
        __args: {
          first: TELEGRAM_USER_LINKS_PAGE_SIZE,
          ...(isNonEmptyString(after) ? { after } : {}),
        },
        edges: { node: { id: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    const connection = queryResult.workspaceMembers;

    for (const edge of connection?.edges ?? []) {
      if (isNonEmptyString(edge?.node?.id)) {
        workspaceMemberIds.push(edge.node.id);
      }
    }

    after =
      connection?.pageInfo?.hasNextPage &&
      isNonEmptyString(connection.pageInfo.endCursor)
        ? connection.pageInfo.endCursor
        : undefined;
  } while (isNonEmptyString(after));

  return workspaceMemberIds;
};
