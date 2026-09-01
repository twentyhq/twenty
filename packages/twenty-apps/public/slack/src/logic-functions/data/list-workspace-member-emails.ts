import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

const MEMBERS_PER_PAGE = 100;
const MAX_PAGES = 10;

export const listWorkspaceMemberEmails = async (
  client: CoreApiClient,
): Promise<Map<string, string>> => {
  const memberIdByEmail = new Map<string, string>();

  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const queryResult = await client.query({
      workspaceMembers: {
        __args: {
          first: MEMBERS_PER_PAGE,
          ...(isDefined(after) ? { after } : {}),
        },
        edges: { node: { id: true, userEmail: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    const edges = queryResult.workspaceMembers?.edges ?? [];

    for (const edge of edges) {
      const node = edge?.node;

      if (isNonEmptyString(node?.id) && isNonEmptyString(node.userEmail)) {
        memberIdByEmail.set(node.userEmail.toLowerCase(), node.id);
      }
    }

    const pageInfo = queryResult.workspaceMembers?.pageInfo;

    if (
      pageInfo?.hasNextPage !== true ||
      !isNonEmptyString(pageInfo.endCursor)
    ) {
      break;
    }

    after = pageInfo.endCursor;
  }

  return memberIdByEmail;
};
