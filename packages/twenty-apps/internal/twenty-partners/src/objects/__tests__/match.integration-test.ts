import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

// mirrors the helper in logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts
async function createPartner(client: CoreApiClient) {
  const r = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: 'Match-test Partner',
          slug: `match-test-${Date.now()}`,
          validationStage: 'VALIDATED',
          availability: 'AVAILABLE',
        },
      },
      id: true,
    },
  } as any);
  return (r as any).createPartner.id as string;
}

describe('Match object — full chain', () => {
  let client: CoreApiClient;
  const cleanup: Array<{ type: string; id: string }> = [];

  beforeAll(() => {
    client = new CoreApiClient();
  });

  afterAll(async () => {
    for (const item of cleanup.reverse()) {
      await client
        .mutation({ [`destroy${item.type}`]: { __args: { id: item.id }, id: true } } as any)
        .catch(() => {});
    }
  });

  it('links Opportunity → Brief → Application → Match and resolves the whole chain', async () => {
    const oppRes = await client.mutation({
      createOpportunity: { __args: { data: { name: 'Match chain opp' } }, id: true },
    } as any);
    const oppId = (oppRes as any).createOpportunity.id as string;
    cleanup.push({ type: 'Opportunity', id: oppId });

    const briefRes = await client.mutation({
      createBrief: { __args: { data: { name: 'Match chain brief', opportunityId: oppId } }, id: true },
    } as any);
    const briefId = (briefRes as any).createBrief.id as string;
    cleanup.push({ type: 'Brief', id: briefId });

    const partnerId = await createPartner(client);
    cleanup.push({ type: 'Partner', id: partnerId });

    const appRes = await client.mutation({
      createApplication: {
        __args: { data: { name: 'Match chain app', briefId, partnerId, state: 'INTRODUCED' } },
        id: true,
      },
    } as any);
    const appId = (appRes as any).createApplication.id as string;
    cleanup.push({ type: 'Application', id: appId });

    const matchRes = await client.mutation({
      createMatch: {
        __args: { data: { name: 'Match chain match', applicationId: appId } },
        id: true,
        outcome: true,
      },
    } as any);
    const match = (matchRes as any).createMatch as { id: string; outcome: string };
    cleanup.push({ type: 'Match', id: match.id });

    expect(match.outcome).toBe('PENDING'); // default

    // walk the full chain — the server resolves one hop of MANY_TO_ONE relations at a
    // time from the root, so we use separate queries to traverse each edge and confirm
    // every link in the chain Opportunity → Brief → Application → Match.

    // match → application
    const q1 = await client.query({
      match: {
        __args: { filter: { id: { eq: match.id } } },
        application: { id: true },
      },
    } as any);
    const m = (q1 as any).match;
    expect(m.application.id).toBe(appId);

    // application → partner + brief
    const q2 = await client.query({
      application: {
        __args: { filter: { id: { eq: appId } } },
        partner: { id: true },
        brief: { id: true },
      },
    } as any);
    const a = (q2 as any).application;
    expect(a.partner.id).toBe(partnerId);
    expect(a.brief.id).toBe(briefId);

    // brief → opportunity
    const q3 = await client.query({
      brief: {
        __args: { filter: { id: { eq: briefId } } },
        opportunity: { id: true },
      },
    } as any);
    expect((q3 as any).brief.opportunity.id).toBe(oppId);

    // reverse relation: application.matches includes the match
    const q4 = await client.query({
      application: {
        __args: { filter: { id: { eq: appId } } },
        matches: { edges: { node: { id: true } } },
      },
    } as any);
    const mids = (q4 as any).application.matches.edges.map((e: any) => e.node.id);
    expect(mids).toContain(match.id);
  });
});
