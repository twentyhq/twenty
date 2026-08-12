import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';
import { type CoreApiClient } from 'twenty-client-sdk/core';

const CANDIDATES_PER_PAGE = 100;
const MAX_PAGES = 10;

// % and _ are ilike wildcards and legal in emails; escaping them makes the
// filter itself an exact case-insensitive match instead of a broad candidate
// query. The in-code comparison below stays as a second layer.
const escapeIlikePattern = (value: string): string =>
  value.replace(/[\\%_]/g, '\\$&');

export const findWorkspaceMemberIdByEmail = async (
  client: CoreApiClient,
  email: string,
): Promise<string | undefined> => {
  const normalizedEmail = email.toLowerCase();
  const matchingMemberIds = new Set<string>();

  let after: string | undefined;

  for (let page = 0; page < MAX_PAGES; page++) {
    const queryResult = await client.query({
      workspaceMembers: {
        __args: {
          filter: { userEmail: { ilike: escapeIlikePattern(email) } },
          first: CANDIDATES_PER_PAGE,
          ...(isDefined(after) ? { after } : {}),
        },
        edges: { node: { id: true, userEmail: true } },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    });

    const edges = queryResult.workspaceMembers?.edges ?? [];

    for (const edge of edges) {
      const node = edge?.node;

      if (
        isNonEmptyString(node?.id) &&
        isNonEmptyString(node.userEmail) &&
        node.userEmail.toLowerCase() === normalizedEmail
      ) {
        matchingMemberIds.add(node.id);
      }
    }

    if (matchingMemberIds.size > 1) {
      return undefined;
    }

    const pageInfo = queryResult.workspaceMembers?.pageInfo;

    if (pageInfo?.hasNextPage !== true) {
      return matchingMemberIds.size === 1
        ? [...matchingMemberIds][0]
        : undefined;
    }

    const endCursor = pageInfo.endCursor;

    if (!isNonEmptyString(endCursor)) {
      return undefined;
    }

    after = endCursor;
  }

  return undefined;
};
