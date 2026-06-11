import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

async function createPartner(client: CoreApiClient) {
  // mirrors the helper in logic-functions/__tests__/on-opportunity-auto-match.integration-test.ts
  const r = await client.mutation({
    createPartner: {
      __args: {
        data: {
          name: 'App-test Partner',
          slug: `app-test-${Date.now()}`,
          validationStage: 'VALIDATED',
          availability: 'AVAILABLE',
        },
      },
      id: true,
    },
  } as any);
  return (r as any).createPartner.id as string;
}

describe('Application object', () => {
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

  it('creates an application linked to a brief and a partner, with defaults', async () => {
    const oppRes = await client.mutation({
      createOpportunity: { __args: { data: { name: 'App test opp' } }, id: true },
    } as any);
    const oppId = (oppRes as any).createOpportunity.id as string;
    cleanup.push({ type: 'Opportunity', id: oppId });

    const briefRes = await client.mutation({
      createBrief: { __args: { data: { name: 'App test brief', opportunityId: oppId } }, id: true },
    } as any);
    const briefId = (briefRes as any).createBrief.id as string;
    cleanup.push({ type: 'Brief', id: briefId });

    const partnerId = await createPartner(client);
    cleanup.push({ type: 'Partner', id: partnerId });

    const appRes = await client.mutation({
      createApplication: {
        __args: { data: { name: 'App test', briefId, partnerId } },
        id: true,
        state: true,
        invitedBy: true,
      },
    } as any);
    const app = (appRes as any).createApplication as {
      id: string;
      state: string;
      invitedBy: string;
    };
    cleanup.push({ type: 'Application', id: app.id });

    expect(app.state).toBe('INVITED'); // default
    expect(app.invitedBy).toBe('ADMIN'); // default

    // forward relations resolve
    const q = await client.query({
      application: {
        __args: { filter: { id: { eq: app.id } } },
        brief: { id: true },
        partner: { id: true },
      },
    } as any);
    expect((q as any).application.brief.id).toBe(briefId);
    expect((q as any).application.partner.id).toBe(partnerId);

    // reverse relation: brief.applications includes it
    const br = await client.query({
      brief: {
        __args: { filter: { id: { eq: briefId } } },
        applications: { edges: { node: { id: true } } },
      },
    } as any);
    const ids = (br as any).brief.applications.edges.map((e: any) => e.node.id);
    expect(ids).toContain(app.id);

    // reverse relation: partner.applications includes it
    const pr = await client.query({
      partner: {
        __args: { filter: { id: { eq: partnerId } } },
        applications: { edges: { node: { id: true } } },
      },
    } as any);
    const pids = (pr as any).partner.applications.edges.map((e: any) => e.node.id);
    expect(pids).toContain(app.id);
  });
});
