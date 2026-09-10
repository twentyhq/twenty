import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

const SLACK_USER_IDS_PER_QUERY = 200;
const LINKS_PER_PAGE = 200;
const MAX_PAGES_PER_QUERY = 5;

export const findDeletedSlackUserLinkIds = async (
  client: CoreApiClient,
  {
    slackTeamId,
    slackUserIds,
  }: { slackTeamId: string; slackUserIds: string[] },
): Promise<string[]> => {
  const deletedLinkIds: string[] = [];

  for (
    let queryStart = 0;
    queryStart < slackUserIds.length;
    queryStart += SLACK_USER_IDS_PER_QUERY
  ) {
    const queriedSlackUserIds = slackUserIds.slice(
      queryStart,
      queryStart + SLACK_USER_IDS_PER_QUERY,
    );

    let after: string | undefined;

    for (let page = 0; page < MAX_PAGES_PER_QUERY; page += 1) {
      const queryResult = await client.query({
        slackUserLinks: {
          __args: {
            filter: {
              slackTeamId: { eq: slackTeamId },
              slackUserId: { in: queriedSlackUserIds },
              deletedAt: { is: 'NOT_NULL' },
            },
            first: LINKS_PER_PAGE,
            ...(isDefined(after) ? { after } : {}),
          },
          edges: { node: { id: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });

      for (const edge of queryResult.slackUserLinks?.edges ?? []) {
        const id = edge?.node?.id;

        if (isNonEmptyString(id)) {
          deletedLinkIds.push(id);
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
  }

  return deletedLinkIds;
};
