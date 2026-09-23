import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildFullName } from 'src/logic-functions/utils/build-full-name';

const MEMBERS_PER_PAGE = 200;

export const findWorkspaceMemberNamesByIds = async (
  client: CoreApiClient,
  { workspaceMemberIds }: { workspaceMemberIds: string[] },
): Promise<Map<string, string | undefined>> => {
  const nameByWorkspaceMemberId = new Map<string, string | undefined>();

  if (workspaceMemberIds.length === 0) {
    return nameByWorkspaceMemberId;
  }

  const queryResult = await client.query({
    workspaceMembers: {
      __args: {
        filter: { id: { in: workspaceMemberIds } },
        first: MEMBERS_PER_PAGE,
      },
      edges: {
        node: { id: true, name: { firstName: true, lastName: true } },
      },
    },
  });

  for (const edge of queryResult.workspaceMembers?.edges ?? []) {
    const node = edge?.node;

    if (!isNonEmptyString(node?.id)) {
      continue;
    }

    nameByWorkspaceMemberId.set(node.id, buildFullName(node.name));
  }

  return nameByWorkspaceMemberId;
};
