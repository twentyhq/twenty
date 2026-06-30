import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import onOpportunityPartnerAssigned from '../on-opportunity-partner-assigned';

// defineLogicFunction wraps the handler in a ValidationResult; the fn is on config.handler.
const handler = onOpportunityPartnerAssigned.config.handler;

function requireId(id: string | null | undefined, what: string): string {
  if (!id) throw new Error(`${what} returned no id`);
  return id;
}

async function getWorkspaceMemberId(client: CoreApiClient): Promise<string> {
  const r = await client.query({
    workspaceMembers: {
      __args: { first: 1 },
      edges: { node: { id: true } },
    },
  });
  const memberId = r.workspaceMembers?.edges?.[0]?.node?.id;
  if (!memberId) throw new Error('No workspace members found — cannot run test');
  return memberId;
}

async function createPartner(client: CoreApiClient, memberId: string): Promise<string> {
  const r = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: `[test-rls] partner ${Date.now()}`,
          slug: `test-rls-${Date.now()}`,
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

async function createCompany(client: CoreApiClient, name: string): Promise<string> {
  const r = await client.mutation({
    createCompany: { __args: { data: { name } }, id: true },
  });
  return requireId(r.createCompany?.id, 'createCompany');
}

async function destroyCompany(client: CoreApiClient, id: string) {
  await client.mutation({ destroyCompany: { __args: { id }, id: true } }).catch(() => {});
}

async function createPerson(client: CoreApiClient, companyId: string): Promise<string> {
  const r = await client.mutation({
    createPerson: {
      __args: { data: { name: { firstName: 'Test', lastName: `RLS-${Date.now()}` }, companyId } },
      id: true,
    },
  });
  return requireId(r.createPerson?.id, 'createPerson');
}

async function destroyPerson(client: CoreApiClient, id: string) {
  await client.mutation({ destroyPerson: { __args: { id }, id: true } }).catch(() => {});
}

async function createOpportunity(
  client: CoreApiClient,
  name: string,
  companyId: string,
): Promise<string> {
  const r = await client.mutation({
    createOpportunity: { __args: { data: { name, companyId } }, id: true },
  });
  return requireId(r.createOpportunity?.id, 'createOpportunity');
}

async function destroyOpportunity(client: CoreApiClient, id: string) {
  await client.mutation({ destroyOpportunity: { __args: { id }, id: true } }).catch(() => {});
}

async function getOpportunityPartnerUserId(
  client: CoreApiClient,
  id: string,
): Promise<string | null> {
  const r = await client.query({
    opportunity: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      partnerUserId: true,
    },
  });
  return r.opportunity?.partnerUserId ?? null;
}

async function getCompanyPartnerUserId(
  client: CoreApiClient,
  id: string,
): Promise<string | null> {
  const r = await client.query({
    company: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      partnerUserId: true,
    },
  });
  return r.company?.partnerUserId ?? null;
}

async function getPersonPartnerUserId(
  client: CoreApiClient,
  id: string,
): Promise<string | null> {
  const r = await client.query({
    person: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      partnerUserId: true,
    },
  });
  return r.person?.partnerUserId ?? null;
}

// Invoke the handler directly against a live workspace to assert its cascade logic and
// resulting DB state deterministically, without depending on the event bus. The trigger
// wiring (opportunity.updated → fires) is covered separately by app sync + manual E2E.
describe('on-opportunity-partner-assigned', () => {
  let client: CoreApiClient;

  // Track created record IDs for cleanup — order matters for FK constraints.
  const createdOpportunityIds: string[] = [];
  const createdPersonIds: string[] = [];
  const createdCompanyIds: string[] = [];
  const createdPartnerIds: string[] = [];

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    // Destroy in reverse FK order.
    for (const id of createdOpportunityIds) await destroyOpportunity(client, id);
    createdOpportunityIds.length = 0;

    for (const id of createdPersonIds) await destroyPerson(client, id);
    createdPersonIds.length = 0;

    for (const id of createdCompanyIds) await destroyCompany(client, id);
    createdCompanyIds.length = 0;

    for (const id of createdPartnerIds) await destroyPartner(client, id);
    createdPartnerIds.length = 0;
  });

  it('returns {} without any mutations when partnerId is not in updatedFields', async () => {
    const result = await handler({
      properties: { updatedFields: ['name'], after: { id: 'fake-id' } },
    });

    expect(result).toEqual({});
  });

  it('clears partnerUser on the opportunity, company, and people when the partner is removed (unassignment)', async () => {
    const memberId = await getWorkspaceMemberId(client);
    const partnerId = await createPartner(client, memberId);
    createdPartnerIds.push(partnerId);
    const companyId = await createCompany(client, `[test-rls] company ${Date.now()}`);
    createdCompanyIds.push(companyId);
    const personId = await createPerson(client, companyId);
    createdPersonIds.push(personId);
    const oppId = await createOpportunity(client, `[test-rls] opp ${Date.now()}`, companyId);
    createdOpportunityIds.push(oppId);

    // Assign first so the opportunity + company + person have partnerUser stamped.
    await handler({
      properties: { updatedFields: ['partnerId'], after: { id: oppId, partnerId, companyId } },
    });
    expect(await getOpportunityPartnerUserId(client, oppId)).toBe(memberId);
    expect(await getCompanyPartnerUserId(client, companyId)).toBe(memberId);
    expect(await getPersonPartnerUserId(client, personId)).toBe(memberId);

    // Now unassign: partnerId set to null. No other opportunity uses this company for the
    // member, so the company + person should be cleared too. `before` carries the removed
    // partnerId so the handler can decide on the source of truth.
    const result = await handler({
      properties: {
        updatedFields: ['partnerId'],
        before: { id: oppId, partnerId, partnerUserId: memberId, companyId },
        after: { id: oppId, partnerId: null, companyId },
      },
    });

    expect(result.cascaded).toBe(true);
    expect(result.cleared).toBe(true);
    expect(await getOpportunityPartnerUserId(client, oppId)).toBeNull();
    expect(await getCompanyPartnerUserId(client, companyId)).toBeNull();
    expect(await getPersonPartnerUserId(client, personId)).toBeNull();
  });

  it('stamps partnerUserId on opportunity, company, and people when partner is assigned', async () => {
    const memberId = await getWorkspaceMemberId(client);
    const partnerId = await createPartner(client, memberId);
    createdPartnerIds.push(partnerId);
    const companyId = await createCompany(client, `[test-rls] company ${Date.now()}`);
    createdCompanyIds.push(companyId);
    const personId = await createPerson(client, companyId);
    createdPersonIds.push(personId);
    const oppId = await createOpportunity(client, `[test-rls] opp ${Date.now()}`, companyId);
    createdOpportunityIds.push(oppId);

    const result = await handler({
      properties: { updatedFields: ['partnerId'], after: { id: oppId, partnerId, companyId } },
    });

    expect(result.cascaded).toBe(true);
    expect(result.partnerUserId).toBe(memberId);
    expect(await getOpportunityPartnerUserId(client, oppId)).toBe(memberId);
    expect(await getCompanyPartnerUserId(client, companyId)).toBe(memberId);
    expect(await getPersonPartnerUserId(client, personId)).toBe(memberId);
  });

  it('stamps partnerUserId on opportunity and returns cascaded: true when no companyId is present', async () => {
    const memberId = await getWorkspaceMemberId(client);
    const partnerId = await createPartner(client, memberId);
    createdPartnerIds.push(partnerId);

    // Opportunity with no linked company, so there is no company/people cascade.
    const r = await client.mutation({
      createOpportunity: {
        __args: { data: { name: `[test-rls] no-company opp ${Date.now()}` } },
        id: true,
      },
    });
    const oppId = requireId(r.createOpportunity?.id, 'createOpportunity');
    createdOpportunityIds.push(oppId);

    const result = await handler({
      properties: { updatedFields: ['partnerId'], after: { id: oppId, partnerId } },
    });

    expect(result.cascaded).toBe(true);
    expect(result.partnerUserId).toBe(memberId);
    expect(await getOpportunityPartnerUserId(client, oppId)).toBe(memberId);
  });

  it('returns { cascaded: false, reason: "partner_has_no_user" } when partner.partnerUserId is null', async () => {
    // Create a partner WITHOUT a partnerUserId.
    const r = await client.mutation({
      createPartner: {
        __args: {
          data: {
            name: `[test-rls] no-user partner ${Date.now()}`,
            slug: `test-rls-nouser-${Date.now()}`,
          },
        },
        id: true,
      },
    });
    const noUserPartnerId = requireId(r.createPartner?.id, 'createPartner');
    createdPartnerIds.push(noUserPartnerId);

    const result = await handler({
      properties: { updatedFields: ['partnerId'], after: { id: 'fake-opp-id', partnerId: noUserPartnerId } },
    });

    expect(result.cascaded).toBe(false);
    expect(result.reason).toBe('partner_has_no_user');
  });
});
