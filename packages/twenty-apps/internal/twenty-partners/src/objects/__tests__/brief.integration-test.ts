import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('Brief object', () => {
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

  it('creates a brief with defaults, linked to an opportunity', async () => {
    const oppRes = await client.mutation({
      createOpportunity: { __args: { data: { name: 'Brief test opp' } }, id: true },
    } as any);
    const oppId = (oppRes as any).createOpportunity.id as string;
    cleanup.push({ type: 'Opportunity', id: oppId });

    const briefRes = await client.mutation({
      createBrief: {
        __args: { data: { name: 'Brief test', need: 'HubSpot to Twenty migration', opportunityId: oppId } },
        id: true,
        need: true,
        status: true,
        issuedBy: true,
      },
    } as any);
    const brief = (briefRes as any).createBrief as {
      id: string;
      need: string;
      status: string;
      issuedBy: string;
    };
    cleanup.push({ type: 'Brief', id: brief.id });

    expect(brief.id).toBeTruthy();
    expect(brief.need).toBe('HubSpot to Twenty migration');
    expect(brief.status).toBe('OPEN');
    expect(brief.issuedBy).toBe('ADMIN');

    const q = await client.query({
      brief: {
        __args: { filter: { id: { eq: brief.id } } },
        id: true,
        opportunity: { id: true },
      },
    } as any);
    expect((q as any).brief.opportunity.id).toBe(oppId);
  });
});
