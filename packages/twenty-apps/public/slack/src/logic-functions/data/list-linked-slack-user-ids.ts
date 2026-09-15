import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

const LINKS_PER_PAGE = 200;
const MAX_PAGES = 25;

export const listLinkedSlackUserIds = async (
  client: CoreApiClient,
  {
    slackTeamId,
    slackUserIds,
  }: { slackTeamId: string; slackUserIds?: string[] },
): Promise<Set<string>> => {
  const linkedSlackUserIds = new Set<string>();

  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const queryResult = await client.query({
      slackUserLinks: {
        __args: {
          filter: {
            slackTeamId: { eq: slackTeamId },
            ...(isDefined(slackUserIds)
              ? { slackUserId: { in: slackUserIds } }
              : {}),
          },
          first: LINKS_PER_PAGE,
          ...(isDefined(after) ? { after } : {}),
        },
        edges: { node: { slackUserId: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    const edges = queryResult.slackUserLinks?.edges ?? [];

    for (const edge of edges) {
      const slackUserId = edge?.node?.slackUserId;

      if (isNonEmptyString(slackUserId)) {
        linkedSlackUserIds.add(slackUserId);
      }
    }

    const pageInfo = queryResult.slackUserLinks?.pageInfo;

    if (
      pageInfo?.hasNextPage !== true ||
      !isNonEmptyString(pageInfo.endCursor)
    ) {
      break;
    }

    after = pageInfo.endCursor;
  }

  return linkedSlackUserIds;
};
