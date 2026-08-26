import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

// Best-effort display name for the consent DM; falls back to undefined so the
// message still reads sensibly when the member cannot be read.
export const findWorkspaceMemberNameById = async (
  client: CoreApiClient,
  workspaceMemberId: string,
): Promise<string | undefined> => {
  const queryResult = await client
    .query({
      workspaceMembers: {
        __args: {
          filter: { id: { eq: workspaceMemberId } },
          first: 1,
        },
        edges: {
          node: { name: { firstName: true, lastName: true } },
        },
      },
    })
    .catch(() => undefined);

  const name = queryResult?.workspaceMembers?.edges?.[0]?.node?.name;

  const fullName = [name?.firstName, name?.lastName]
    .filter(isNonEmptyString)
    .join(' ')
    .trim();

  return isNonEmptyString(fullName) ? fullName : undefined;
};
