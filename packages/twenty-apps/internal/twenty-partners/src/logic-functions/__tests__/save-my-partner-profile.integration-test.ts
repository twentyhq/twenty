import { CoreApiClient, type CoreSchema } from 'twenty-client-sdk/core';
import { type RoutePayload } from 'twenty-sdk/define';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { handler } from '../save-my-partner-profile.logic-function';

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

async function createPartner(
  client: CoreApiClient,
  memberId: string,
  overrides: {
    name?: string;
    region?: CoreSchema.PartnerRegionEnum[];
    deploymentExpertise?: CoreSchema.PartnerDeploymentExpertiseEnum[];
  } = {},
): Promise<string> {
  const r = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: overrides.name ?? `[test-save-profile] partner ${Date.now()}`,
          slug: `test-save-profile-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          partnerUserId: memberId,
          city: 'Paris',
          region: overrides.region,
          deploymentExpertise: overrides.deploymentExpertise,
        },
      },
      id: true,
    },
  });
  return requireId(r.createPartner?.id, 'createPartner');
}

// A partner that is not linked to any workspace member — stands in for "someone
// else's record" so the test can assert the save route never touches it.
async function createUnlinkedPartner(client: CoreApiClient): Promise<string> {
  const r = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: `[test-save-profile] other partner ${Date.now()}`,
          slug: `test-save-profile-other-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
      },
      id: true,
    },
  });
  return requireId(r.createPartner?.id, 'createPartner');
}

async function destroyPartner(client: CoreApiClient, id: string) {
  // Let a failed delete surface so leaked fixtures are visible instead of silently kept.
  await client.mutation({ destroyPartner: { __args: { id }, id: true } });
}

async function getPartner(client: CoreApiClient, id: string) {
  const r = await client.query({
    partners: {
      __args: { filter: { id: { eq: id } }, first: 1 },
      edges: {
        node: {
          id: true,
          name: true,
          city: true,
          country: true,
          typeOfTeam: true,
          hourlyRate: { amountMicros: true, currencyCode: true },
          website: { primaryLinkUrl: true },
          region: true,
          deploymentExpertise: true,
        },
      },
    },
  });
  const node = r.partners?.edges?.[0]?.node;
  if (!node) throw new Error(`partner ${id} not found`);
  return node;
}

const makeToken = (payload: Record<string, unknown>): string => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `header.${body}.sig`;
};

const makeRouteEvent = (
  userWorkspaceId: string | null,
  body: unknown,
): RoutePayload<unknown> => ({
  headers: {},
  queryStringParameters: {},
  pathParameters: {},
  body,
  isBase64Encoded: false,
  requestContext: { http: { method: 'POST', path: '/save-my-partner-profile' } },
  userWorkspaceId,
});

// Invoke the handler directly against a live workspace, crafting the same short-lived env
// token resolvePartnerFromRequest decodes (see resolve-partner-from-request.test.ts), so the
// full identity → save path is exercised without a real authenticated HTTP request.
describe('save-my-partner-profile', () => {
  let client: CoreApiClient;
  const originalToken = process.env.TWENTY_APP_ACCESS_TOKEN;

  const createdPartnerIds: string[] = [];

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    if (originalToken === undefined) delete process.env.TWENTY_APP_ACCESS_TOKEN;
    else process.env.TWENTY_APP_ACCESS_TOKEN = originalToken;

    for (const id of createdPartnerIds.splice(0)) await destroyPartner(client, id);
  });

  it('returns UNAUTHENTICATED when the event has no userWorkspaceId', async () => {
    const result = await handler(makeRouteEvent(null, { name: 'New name' }));

    expect(result).toEqual({ ok: false, reason: 'UNAUTHENTICATED' });
  });

  it('rejects an invalid body before writing anything', async () => {
    const member = await getWorkspaceMember(client);
    const partnerId = await createPartner(client, member.id, { name: 'Original name' });
    createdPartnerIds.push(partnerId);

    const userWorkspaceId = `uw-test-invalid-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({ userId: member.userId, userWorkspaceId });

    const result = await handler(makeRouteEvent(userWorkspaceId, { website: 'not-a-url' }));

    expect(result.ok).toBe(false);

    const partner = await getPartner(client, partnerId);
    expect(partner.name).toBe('Original name');
  });

  it('rejects an unknown enum value without writing anything', async () => {
    const member = await getWorkspaceMember(client);
    const partnerId = await createPartner(client, member.id, { name: 'Original name' });
    createdPartnerIds.push(partnerId);

    const userWorkspaceId = `uw-test-badenum-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({ userId: member.userId, userWorkspaceId });

    const result = await handler(makeRouteEvent(userWorkspaceId, { country: 'NOPE' }));

    expect(result).toEqual({ ok: false, reason: 'Unknown country: NOPE' });

    const partner = await getPartner(client, partnerId);
    expect(partner.country).toBeNull();
  });

  it('writes only the editable fields provided in the body', async () => {
    const member = await getWorkspaceMember(client);
    const partnerId = await createPartner(client, member.id, {
      name: 'Original name',
      region: ['EUROPE'],
      deploymentExpertise: ['CLOUD'],
    });
    createdPartnerIds.push(partnerId);

    const userWorkspaceId = `uw-test-write-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({ userId: member.userId, userWorkspaceId });

    const result = await handler(
      makeRouteEvent(userWorkspaceId, {
        name: 'Updated name',
        city: 'Berlin',
        country: 'GERMANY',
        typeOfTeam: 'AGENCY',
        hourlyRate: { amountMicros: 150000000, currencyCode: 'USD' },
        website: 'https://updated.example.com',
      }),
    );

    expect(result).toEqual({ ok: true });

    const partner = await getPartner(client, partnerId);
    expect(partner.name).toBe('Updated name');
    expect(partner.city).toBe('Berlin');
    expect(partner.country).toBe('GERMANY');
    expect(partner.typeOfTeam).toBe('AGENCY');
    expect(partner.hourlyRate).toEqual({ amountMicros: 150000000, currencyCode: 'USD' });
    expect(partner.website?.primaryLinkUrl).toBe('https://updated.example.com');

    // Admin-only fields are never in the editable schema, so they must survive untouched.
    expect(partner.region).toEqual(['EUROPE']);
    expect(partner.deploymentExpertise).toEqual(['CLOUD']);
  });

  it('never writes to another partner even if the body tries to reference one', async () => {
    const member = await getWorkspaceMember(client);
    const myPartnerId = await createPartner(client, member.id, { name: 'My original name' });
    createdPartnerIds.push(myPartnerId);
    const otherPartnerId = await createUnlinkedPartner(client);
    createdPartnerIds.push(otherPartnerId);

    const userWorkspaceId = `uw-test-foreign-${Date.now()}`;
    process.env.TWENTY_APP_ACCESS_TOKEN = makeToken({ userId: member.userId, userWorkspaceId });

    // `partnerId` is not a key in saveProfileSchema, so `.strict()` rejects the whole
    // request outright — there is no way to redirect the write via the body.
    const result = await handler(
      makeRouteEvent(userWorkspaceId, {
        name: 'Hijacked name',
        partnerId: otherPartnerId,
      }),
    );

    expect(result.ok).toBe(false);

    const mine = await getPartner(client, myPartnerId);
    const other = await getPartner(client, otherPartnerId);
    expect(mine.name).toBe('My original name');
    expect(other.name).not.toBe('Hijacked name');
  });
});
