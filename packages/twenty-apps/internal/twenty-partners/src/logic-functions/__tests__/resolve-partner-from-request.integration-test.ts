import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  decodeJwtClaims,
  resolvePartnerByUserId,
  resolvePartnerFromRequest,
} from '../resolve-partner-from-request';

function requireId(id: string | null | undefined, what: string): string {
  if (!id) throw new Error(`${what} returned no id`);
  return id;
}

async function getWorkspaceMember(
  client: CoreApiClient,
): Promise<{ id: string; userId: string }> {
  const r = await client.query({
    workspaceMembers: {
      __args: { first: 1 },
      edges: { node: { id: true, userId: true } },
    },
  });
  const node = r.workspaceMembers?.edges?.[0]?.node;
  if (!node?.id || !node?.userId) {
    throw new Error('No workspace members found — cannot run test');
  }
  return { id: node.id, userId: node.userId };
}

async function createPartner(client: CoreApiClient, memberId: string): Promise<string> {
  const r = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: `[test-resolve] partner ${Date.now()}`,
          slug: `test-resolve-${Date.now()}`,
          partnerUserId: memberId,
        },
      },
      id: true,
    },
  });
  return requireId(r.createPartner?.id, 'createPartner');
}

async function destroyPartner(client: CoreApiClient, id: string) {
  await client.mutation({ destroyPartner: { __args: { id }, id: true } }).catch(() => {});
}

describe('decodeJwtClaims', () => {
  it('decodes the base64url payload segment of a JWT', () => {
    const payload = Buffer.from(
      JSON.stringify({ userId: 'u-1', userWorkspaceId: 'uw-1' }),
    ).toString('base64url');
    const token = `header.${payload}.sig`;

    expect(decodeJwtClaims(token)).toEqual({ userId: 'u-1', userWorkspaceId: 'uw-1' });
  });

  it('returns {} for a garbage string', () => {
    expect(decodeJwtClaims('not-a-jwt')).toEqual({});
  });
});

describe('resolvePartnerByUserId', () => {
  let client: CoreApiClient;
  const createdPartnerIds: string[] = [];

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    for (const id of createdPartnerIds) await destroyPartner(client, id);
    createdPartnerIds.length = 0;
  });

  it('resolves partnerId and workspaceMemberId for a member with a linked partner', async () => {
    const member = await getWorkspaceMember(client);
    const partnerId = await createPartner(client, member.id);
    createdPartnerIds.push(partnerId);

    const result = await resolvePartnerByUserId(client, member.userId);

    expect(result).toEqual({ partnerId, workspaceMemberId: member.id });
  });

  it('returns null for a userId with no matching workspace member', async () => {
    const result = await resolvePartnerByUserId(client, '11111111-1111-4111-8111-111111111111');

    expect(result).toBeNull();
  });
});

describe('resolvePartnerFromRequest', () => {
  it('returns UNAUTHENTICATED when event.userWorkspaceId is absent', async () => {
    const result = await resolvePartnerFromRequest({ userWorkspaceId: null });

    expect(result).toEqual({ error: 'UNAUTHENTICATED' });
  });
});
