import { isObject } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isStudioRecordIdentifier } from 'src/logic-functions/utils/session-mutation-lock';

const isRecord = isObject<Record<string, unknown>, unknown>;
export const inspectMembershipMutationLock = async (
  client: CoreApiClient,
  membershipId: string,
): Promise<
  { status: 'read'; token: string | null } | { status: 'unconfirmed' }
> => {
  try {
    const response: unknown = await client.query({
      studioMemberships: {
        __args: { filter: { id: { eq: membershipId } }, first: 2 },
        edges: { node: { id: true, mutationLock: true } },
        pageInfo: { hasNextPage: true },
      },
    } as never);
    if (
      !isRecord(response) ||
      response.errors !== undefined ||
      !isRecord(response.studioMemberships)
    )
      return { status: 'unconfirmed' };
    const connection = response.studioMemberships;
    if (
      !Array.isArray(connection.edges) ||
      connection.edges.length !== 1 ||
      !isRecord(connection.pageInfo) ||
      connection.pageInfo.hasNextPage !== false
    )
      return { status: 'unconfirmed' };
    const edge: unknown = connection.edges[0];
    if (
      !isRecord(edge) ||
      !isRecord(edge.node) ||
      edge.node.id !== membershipId ||
      !(
        edge.node.mutationLock === null ||
        typeof edge.node.mutationLock === 'string'
      )
    )
      return { status: 'unconfirmed' };
    return {
      status: 'read',
      token: edge.node.mutationLock === '' ? null : edge.node.mutationLock,
    };
  } catch {
    return { status: 'unconfirmed' };
  }
};

export const changeMembershipMutationLock = async (
  client: CoreApiClient,
  membershipId: string,
  owner: string,
  action: 'acquire' | 'release',
): Promise<'confirmed' | 'busy' | 'unconfirmed'> => {
  if (!isStudioRecordIdentifier(membershipId) || !owner) return 'unconfirmed';
  try {
    const result: unknown = await client.mutation({
      updateStudioMemberships: {
        __args: {
          filter: {
            and: [
              { id: { eq: membershipId } },
              {
                mutationLock:
                  action === 'acquire' ? { is: 'NULL' } : { eq: owner },
              },
            ],
          },
          data: { mutationLock: action === 'acquire' ? owner : null },
        },
        id: true,
        mutationLock: true,
      },
    } as never);
    if (
      isRecord(result) &&
      result.errors === undefined &&
      Array.isArray(result.updateStudioMemberships) &&
      result.updateStudioMemberships.length === 0 &&
      action === 'acquire'
    )
      return 'busy';
  } catch {
    // A lost response can still have acquired or released this owner's resource.
  }
  const inspected = await inspectMembershipMutationLock(client, membershipId);
  if (inspected.status !== 'read') return 'unconfirmed';
  return (
    action === 'acquire' ? inspected.token === owner : inspected.token !== owner
  )
    ? 'confirmed'
    : 'unconfirmed';
};
