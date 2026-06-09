import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// Lazily import the handler under test so the "module not found" failure is
// clear when the implementation file doesn't exist yet (TDD red phase).
type HandlerFn = (payload: { properties: unknown }) => Promise<unknown>;
let handler: HandlerFn | undefined;
try {
  // Dynamic import so the test file can be parsed even when the impl is absent.
  // defineLogicFunction returns ValidationResult<LogicFunctionConfig> which has
  // a `config` property containing the original handler.
  const mod = await import('../on-opportunity-partner-assigned');
  // mod.default is ValidationResult<LogicFunctionConfig>; config.handler is the fn.
  handler = (mod.default as any)?.config?.handler as HandlerFn | undefined;
} catch {
  // Implementation not yet written — tests will fail with a clear message.
  handler = undefined;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getWorkspaceMemberId(client: CoreApiClient): Promise<string> {
  const r = await client.query({
    workspaceMembers: {
      __args: { first: 1 },
      edges: { node: { id: true } },
    },
  } as any);
  const edges = ((r as any).workspaceMembers?.edges ?? []) as { node: { id: string } }[];
  if (edges.length === 0) throw new Error('No workspace members found — cannot run test');
  return edges[0].node.id;
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
  } as any);
  return (r as any).createPartner.id as string;
}

async function destroyPartner(client: CoreApiClient, id: string) {
  await client
    .mutation({ destroyPartner: { __args: { id }, id: true } } as any)
    .catch(() => {});
}

async function createCompany(client: CoreApiClient, name: string): Promise<string> {
  const r = await client.mutation({
    createCompany: {
      __args: { data: { name } },
      id: true,
    },
  } as any);
  return (r as any).createCompany.id as string;
}

async function destroyCompany(client: CoreApiClient, id: string) {
  await client
    .mutation({ destroyCompany: { __args: { id }, id: true } } as any)
    .catch(() => {});
}

async function createPerson(client: CoreApiClient, companyId: string): Promise<string> {
  const r = await client.mutation({
    createPerson: {
      __args: { data: { name: { firstName: 'Test', lastName: `RLS-${Date.now()}` }, companyId } },
      id: true,
    },
  } as any);
  return (r as any).createPerson.id as string;
}

async function destroyPerson(client: CoreApiClient, id: string) {
  await client
    .mutation({ destroyPerson: { __args: { id }, id: true } } as any)
    .catch(() => {});
}

async function createOpportunity(
  client: CoreApiClient,
  name: string,
  companyId: string,
): Promise<string> {
  const r = await client.mutation({
    createOpportunity: {
      __args: { data: { name, companyId } },
      id: true,
    },
  } as any);
  return (r as any).createOpportunity.id as string;
}

async function destroyOpportunity(client: CoreApiClient, id: string) {
  await client
    .mutation({ destroyOpportunity: { __args: { id }, id: true } } as any)
    .catch(() => {});
}

async function getOpportunity(
  client: CoreApiClient,
  id: string,
): Promise<{ id: string; partnerUserId: string | null }> {
  const r = await client.query({
    opportunity: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      partnerUserId: true,
    },
  } as any);
  return (r as any).opportunity as { id: string; partnerUserId: string | null };
}

async function getCompany(
  client: CoreApiClient,
  id: string,
): Promise<{ id: string; partnerUserId: string | null }> {
  const r = await client.query({
    company: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      partnerUserId: true,
    },
  } as any);
  return (r as any).company as { id: string; partnerUserId: string | null };
}

async function getPerson(
  client: CoreApiClient,
  id: string,
): Promise<{ id: string; partnerUserId: string | null }> {
  const r = await client.query({
    person: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      partnerUserId: true,
    },
  } as any);
  return (r as any).person as { id: string; partnerUserId: string | null };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Test strategy
// ---------------------------------------------------------------------------
// These tests invoke the handler directly (in-process) to verify its cascade
// logic deterministically against a live workspace. Direct invocation lets us
// assert exact return values and DB state without depending on the event bus.
//
// The end-to-end trigger wiring (opportunity.updated → function fires) is
// verified separately: the app sync step registers the function with the
// correct databaseEventTriggerSettings, and Task 5's manual E2E confirms the
// cascade fires when a partner is assigned via the UI. That deliberate split
// keeps these unit-style integration tests fast and reproducible.
// ---------------------------------------------------------------------------

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

  // -------------------------------------------------------------------------
  // No-op guard: when partnerId is not in updatedFields, handler returns {}
  // -------------------------------------------------------------------------
  it('returns {} without any mutations when partnerId is not in updatedFields', async () => {
    if (!handler) throw new Error('Handler not found — implementation file missing');

    const result = await handler({
      properties: { updatedFields: ['name'], after: { id: 'fake-id' } },
    } as never);

    expect(result).toEqual({});
  });

  // -------------------------------------------------------------------------
  // Unassign: partnerId cleared → the opportunity's partnerUser is cleared so it
  // leaves the partner's row-level view.
  // -------------------------------------------------------------------------
  it('clears the opportunity partnerUser when the partner is removed (unassignment)', async () => {
    if (!handler) throw new Error('Handler not found — implementation file missing');

    const memberId = await getWorkspaceMemberId(client);
    const partnerId = await createPartner(client, memberId);
    createdPartnerIds.push(partnerId);
    const companyId = await createCompany(client, `[test-rls] company ${Date.now()}`);
    createdCompanyIds.push(companyId);
    const oppId = await createOpportunity(client, `[test-rls] opp ${Date.now()}`, companyId);
    createdOpportunityIds.push(oppId);

    // Assign first so the opportunity has partnerUser stamped.
    await handler({
      properties: { updatedFields: ['partnerId'], after: { id: oppId, partnerId, companyId } },
    } as never);
    expect((await getOpportunity(client, oppId)).partnerUserId).toBe(memberId);

    // Now unassign: partnerId set to null.
    const result = await handler({
      properties: { updatedFields: ['partnerId'], after: { id: oppId, partnerId: null, companyId } },
    } as never);

    expect((result as any).cascaded).toBe(true);
    expect((result as any).cleared).toBe(true);
    expect((await getOpportunity(client, oppId)).partnerUserId).toBeNull();
  });

  // -------------------------------------------------------------------------
  // Happy path: cascades partnerUser to opportunity, company, and people
  // -------------------------------------------------------------------------
  it('stamps partnerUserId on opportunity, company, and people when partner is assigned', async () => {
    if (!handler) throw new Error('Handler not found — implementation file missing');

    // 1. Resolve an existing workspace member to use as the partner's user.
    const memberId = await getWorkspaceMemberId(client);

    // 2. Create a Partner with partnerUserId pointing to that member.
    const partnerId = await createPartner(client, memberId);
    createdPartnerIds.push(partnerId);

    // 3. Create a Company (partnerUser unset).
    const companyId = await createCompany(client, `[test-rls] company ${Date.now()}`);
    createdCompanyIds.push(companyId);

    // 4. Create a Person on that Company (partnerUser unset).
    const personId = await createPerson(client, companyId);
    createdPersonIds.push(personId);

    // 5. Create an Opportunity linked to the Company, with no partner yet.
    const oppId = await createOpportunity(
      client,
      `[test-rls] opp ${Date.now()}`,
      companyId,
    );
    createdOpportunityIds.push(oppId);

    // 6. Invoke handler directly, simulating opportunity.updated with partnerId change.
    const result = await handler({
      properties: {
        updatedFields: ['partnerId'],
        after: { id: oppId, partnerId, companyId },
      },
    } as never);

    // 7. Assert handler reports cascaded: true and the correct memberId.
    expect((result as any).cascaded).toBe(true);
    expect((result as any).partnerUserId).toBe(memberId);

    // 8. Re-query all three records and verify partnerUserId was stamped.
    const opp = await getOpportunity(client, oppId);
    expect(opp.partnerUserId).toBe(memberId);

    const company = await getCompany(client, companyId);
    expect(company.partnerUserId).toBe(memberId);

    const person = await getPerson(client, personId);
    expect(person.partnerUserId).toBe(memberId);
  });

  // -------------------------------------------------------------------------
  // No linked company — only opportunity is stamped; no company/people cascade
  // -------------------------------------------------------------------------
  it('stamps partnerUserId on opportunity and returns cascaded: true when no companyId is present', async () => {
    if (!handler) throw new Error('Handler not found — implementation file missing');

    // 1. Resolve an existing workspace member to use as the partner's user.
    const memberId = await getWorkspaceMemberId(client);

    // 2. Create a Partner with partnerUserId.
    const partnerId = await createPartner(client, memberId);
    createdPartnerIds.push(partnerId);

    // 3. Create an Opportunity with NO linked company (companyId omitted from payload).
    const r = await client.mutation({
      createOpportunity: {
        __args: { data: { name: `[test-rls] no-company opp ${Date.now()}` } },
        id: true,
      },
    } as any);
    const oppId = (r as any).createOpportunity.id as string;
    createdOpportunityIds.push(oppId);

    // 4. Invoke handler with no companyId in the after payload.
    const result = await handler({
      properties: {
        updatedFields: ['partnerId'],
        after: { id: oppId, partnerId },
      },
    } as never);

    // 5. Handler should still report cascaded: true with the correct memberId.
    expect((result as any).cascaded).toBe(true);
    expect((result as any).partnerUserId).toBe(memberId);

    // 6. Opportunity should have partnerUserId stamped.
    const opp = await getOpportunity(client, oppId);
    expect(opp.partnerUserId).toBe(memberId);
  });

  // -------------------------------------------------------------------------
  // Partner has no partnerUserId — cascade is skipped gracefully
  // -------------------------------------------------------------------------
  it('returns { cascaded: false, reason: "partner_has_no_user" } when partner.partnerUserId is null', async () => {
    if (!handler) throw new Error('Handler not found — implementation file missing');

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
    } as any);
    const noUserPartnerId = (r as any).createPartner.id as string;
    createdPartnerIds.push(noUserPartnerId);

    const result = await handler({
      properties: {
        updatedFields: ['partnerId'],
        after: { id: 'fake-opp-id', partnerId: noUserPartnerId },
      },
    } as never);

    expect((result as any).cascaded).toBe(false);
    expect((result as any).reason).toBe('partner_has_no_user');
  });
});
