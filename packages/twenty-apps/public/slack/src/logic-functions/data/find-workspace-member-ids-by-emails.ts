import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { escapeSqlLikePattern } from 'src/logic-functions/utils/escape-sql-like-pattern.util';

const EMAILS_PER_QUERY = 50;
const MEMBERS_PER_PAGE = 200;
const MAX_PAGES_PER_QUERY = 5;

type WorkspaceMemberEmailLookup = {
  workspaceMemberIdByEmail: Map<string, string>;
  ambiguousEmailCount: number;
};

export const findWorkspaceMemberIdsByEmails = async (
  client: CoreApiClient,
  { emails }: { emails: string[] },
): Promise<WorkspaceMemberEmailLookup> => {
  const lookedUpEmails = [
    ...new Set(emails.map((email) => email.toLowerCase())),
  ];
  const workspaceMemberIdByEmail = new Map<string, string>();
  const ambiguousEmails = new Set<string>();

  for (
    let queryStart = 0;
    queryStart < lookedUpEmails.length;
    queryStart += EMAILS_PER_QUERY
  ) {
    const queriedEmails = lookedUpEmails.slice(
      queryStart,
      queryStart + EMAILS_PER_QUERY,
    );

    let after: string | undefined;

    for (let page = 0; page < MAX_PAGES_PER_QUERY; page += 1) {
      const queryResult = await client.query({
        workspaceMembers: {
          __args: {
            filter: {
              or: queriedEmails.map((email) => ({
                userEmail: { ilike: escapeSqlLikePattern(email) },
              })),
            },
            first: MEMBERS_PER_PAGE,
            ...(isDefined(after) ? { after } : {}),
          },
          edges: { node: { id: true, userEmail: true } },
          pageInfo: { hasNextPage: true, endCursor: true },
        },
      });

      for (const edge of queryResult.workspaceMembers?.edges ?? []) {
        const node = edge?.node;

        if (!isNonEmptyString(node?.id) || !isNonEmptyString(node.userEmail)) {
          continue;
        }

        const email = node.userEmail.toLowerCase();
        const alreadyMappedMemberId = workspaceMemberIdByEmail.get(email);

        if (
          isDefined(alreadyMappedMemberId) &&
          alreadyMappedMemberId !== node.id
        ) {
          ambiguousEmails.add(email);
          continue;
        }

        workspaceMemberIdByEmail.set(email, node.id);
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
  }

  for (const ambiguousEmail of ambiguousEmails) {
    workspaceMemberIdByEmail.delete(ambiguousEmail);
  }

  return {
    workspaceMemberIdByEmail,
    ambiguousEmailCount: ambiguousEmails.size,
  };
};
