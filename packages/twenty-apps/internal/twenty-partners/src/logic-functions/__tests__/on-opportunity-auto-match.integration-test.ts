import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

// Helpers
async function createOpp(client: CoreApiClient, name: string) {
  const r = await client.mutation({
    createOpportunity: {
      __args: { data: { name } },
      id: true,
      matchStatus: true,
    },
  } as any);
  return (r as any).createOpportunity as { id: string; matchStatus: string };
}

async function destroyOpp(client: CoreApiClient, id: string) {
  await client
    .mutation({ destroyOpportunity: { __args: { id }, id: true } } as any)
    .catch(() => {});
}

async function getOpp(client: CoreApiClient, id: string) {
  const r = await client.query({
    opportunity: {
      __args: { filter: { id: { eq: id } } },
      id: true,
      matchStatus: true,
      partner: { id: true },
    },
  } as any);
  return (r as any).opportunity as {
    id: string;
    matchStatus: string;
    partner: { id: string } | null;
  };
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

describe('on-opportunity-auto-match (success path)', () => {
  let client: CoreApiClient;
  const created: string[] = [];
  let seededPartnerId: string | null = null;

  beforeAll(async () => {
    client = new CoreApiClient();
    // Ensure at least one ACTIVE+AVAILABLE partner exists for the function to pick.
    const existing = await client.query({
      partners: {
        __args: {
          filter: { validationStage: { eq: 'VALIDATED' }, availability: { eq: 'AVAILABLE' } },
          first: 1,
        },
        edges: { node: { id: true } },
      },
    } as any);
    if ((existing as any).partners.edges.length === 0) {
      const r = await client.mutation({
        createPartner: {
          __args: {
            data: {
              name: '[test] auto-match seed partner',
              slug: 'test-auto-match-seed',
              validationStage: 'VALIDATED',
              availability: 'AVAILABLE',
            },
          },
          id: true,
        },
      } as any);
      seededPartnerId = (r as any).createPartner.id;
    }
  });

  afterAll(async () => {
    if (seededPartnerId) {
      await client
        .mutation({ destroyPartner: { __args: { id: seededPartnerId }, id: true } } as any)
        .catch(() => {});
    }
  });

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    for (const id of created) await destroyOpp(client, id);
    created.length = 0;
  });

  it('defaults a new opportunity to TO_BE_MATCHED', async () => {
    const opp = await createOpp(client, `[test] default status ${Date.now()}`);
    created.push(opp.id);
    expect(opp.matchStatus).toBe('TO_BE_MATCHED');
  });

  it('assigns a partner and flips to MATCHED when set to AUTO_MATCH', async () => {
    const opp = await createOpp(client, `[test] auto match ${Date.now()}`);
    created.push(opp.id);

    await client.mutation({
      updateOpportunity: {
        __args: { id: opp.id, data: { matchStatus: 'AUTO_MATCH' } },
        id: true,
      },
    } as any);

    // Logic function runs async (~2s per spec). Poll up to 10s.
    let final = await getOpp(client, opp.id);
    for (let i = 0; i < 20 && final.matchStatus === 'AUTO_MATCH'; i++) {
      await sleep(500);
      final = await getOpp(client, opp.id);
    }

    expect(final.matchStatus).toBe('MATCHED');
    expect(final.partner?.id).toBeDefined();
  });
});

describe('on-opportunity-auto-match (failure path)', () => {
  let client: CoreApiClient;
  const createdOpps: string[] = [];
  const flippedPartners: Array<{ id: string; prevAvailability: string }> = [];

  beforeEach(() => {
    client = new CoreApiClient();
  });

  afterEach(async () => {
    // Restore partner availabilities first so other tests find a partner.
    for (const p of flippedPartners) {
      await client
        .mutation({
          updatePartner: {
            __args: { id: p.id, data: { availability: p.prevAvailability } },
            id: true,
          },
        } as any)
        .catch(() => {});
    }
    flippedPartners.length = 0;

    for (const id of createdOpps) await destroyOpp(client, id);
    createdOpps.length = 0;
  });

  it('hands off to MANUAL_MATCH with a Note when no partner is available', async () => {
    // Make every AVAILABLE partner UNAVAILABLE for the duration of this test.
    const all = await client.query({
      partners: {
        __args: {
          filter: { availability: { eq: 'AVAILABLE' } },
          first: 100,
        },
        edges: { node: { id: true, availability: true } },
      },
    } as any);

    const edges = ((all as any)?.partners?.edges ?? []) as Array<{
      node: { id: string; availability: string };
    }>;

    for (const e of edges) {
      flippedPartners.push({ id: e.node.id, prevAvailability: e.node.availability });
      await client.mutation({
        updatePartner: {
          __args: { id: e.node.id, data: { availability: 'UNAVAILABLE' } },
          id: true,
        },
      } as any);
    }

    const opp = await createOpp(client, `[test] no-partner ${Date.now()}`);
    createdOpps.push(opp.id);

    await client.mutation({
      updateOpportunity: {
        __args: { id: opp.id, data: { matchStatus: 'AUTO_MATCH' } },
        id: true,
      },
    } as any);

    let final = await getOpp(client, opp.id);
    for (let i = 0; i < 20 && final.matchStatus === 'AUTO_MATCH'; i++) {
      await sleep(500);
      final = await getOpp(client, opp.id);
    }

    expect(final.matchStatus).toBe('MANUAL_MATCH');
    expect(final.partner).toBeNull();

    // Confirm a Note was attached.
    const notes = await client.query({
      noteTargets: {
        __args: {
          filter: { targetOpportunityId: { eq: opp.id } },
          first: 10,
        },
        edges: {
          node: {
            id: true,
            note: { id: true, title: true, bodyV2: { markdown: true } },
          },
        },
      },
    } as any);
    const noteEdges = ((notes as any)?.noteTargets?.edges ?? []) as Array<{
      node: { note: { title: string; bodyV2: { markdown: string } } };
    }>;

    const autoMatchNote = noteEdges.find((e) =>
      e.node.note.title.toLowerCase().includes('auto-match'),
    );
    expect(autoMatchNote).toBeDefined();
    expect(autoMatchNote!.node.note.bodyV2.markdown).toContain('No partners');
  });
});
