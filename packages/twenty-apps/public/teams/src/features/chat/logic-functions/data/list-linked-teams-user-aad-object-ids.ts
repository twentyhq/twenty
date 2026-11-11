import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

const LINKS_PER_PAGE = 200;
const MAX_PAGES = 25;

export const listLinkedTeamsUserAadObjectIds = async ({
  client,
  teamsTenantId,
}: {
  client: Pick<CoreApiClient, 'query'>;
  teamsTenantId: string;
}): Promise<Set<string>> => {
  const linkedAadObjectIds = new Set<string>();

  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const queryResult = await client.query({
      teamsUserLinks: {
        __args: {
          filter: { teamsTenantId: { eq: teamsTenantId } },
          first: LINKS_PER_PAGE,
          ...(isNonEmptyString(after) ? { after } : {}),
        },
        edges: { node: { teamsUserAadObjectId: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    for (const edge of queryResult.teamsUserLinks?.edges ?? []) {
      const teamsUserAadObjectId = edge?.node?.teamsUserAadObjectId;

      if (isNonEmptyString(teamsUserAadObjectId)) {
        linkedAadObjectIds.add(teamsUserAadObjectId);
      }
    }

    const pageInfo = queryResult.teamsUserLinks?.pageInfo;

    if (
      pageInfo?.hasNextPage !== true ||
      !isNonEmptyString(pageInfo.endCursor)
    ) {
      return linkedAadObjectIds;
    }

    after = pageInfo.endCursor;
  }

  throw new Error(
    `More than ${MAX_PAGES * LINKS_PER_PAGE} Teams user links exist for this tenant, so the unlinked users cannot be listed. Use the search to find a specific person.`,
  );
};
