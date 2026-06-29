import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { handler, type SubmitClientBriefInput } from '../submit-client-brief.logic-function';

const TEST_SECRET = 'test-secret-abc123';
process.env.PARTNER_APPLICATION_SECRET = TEST_SECRET;

const client = new CoreApiClient();

const baseInput = (overrides: Partial<SubmitClientBriefInput> = {}): SubmitClientBriefInput => ({
  firstName: 'Jane',
  lastName: 'Smith',
  email: `jane.brief.${Date.now()}@example.com`,
  companyName: `Acme Brief Co ${Date.now()}`,
  need: 'Set up CRM pipelines for sales',
  ...overrides,
});

const authedEvent = (input: SubmitClientBriefInput) => ({
  body: input,
  headers: { 'x-application-secret': TEST_SECRET },
});

const createdOpportunityIds: string[] = [];
const createdPersonIds: string[] = [];
const createdCompanyIds: string[] = [];

async function cleanup(): Promise<void> {
  for (const id of createdOpportunityIds.splice(0)) {
    await client.mutation({ destroyOpportunity: { __args: { id }, id: true } }).catch(() => {});
  }
  for (const id of createdPersonIds.splice(0)) {
    await client.mutation({ destroyPerson: { __args: { id }, id: true } }).catch(() => {});
  }
  for (const id of createdCompanyIds.splice(0)) {
    await client.mutation({ destroyCompany: { __args: { id }, id: true } }).catch(() => {});
  }
}

async function trackCreatedOpportunity(opportunityId: string): Promise<void> {
  createdOpportunityIds.push(opportunityId);

  const fetched = await client.query({
    opportunity: {
      __args: { filter: { id: { eq: opportunityId } } },
      company: { id: true },
      pointOfContact: { id: true },
    },
  });

  if (fetched.opportunity?.company?.id) createdCompanyIds.push(fetched.opportunity.company.id);
  if (fetched.opportunity?.pointOfContact?.id) {
    createdPersonIds.push(fetched.opportunity.pointOfContact.id);
  }
}

afterEach(async () => {
  await cleanup();
});

beforeAll(async () => {
  await client.query({ opportunities: { __args: { first: 1 }, edges: { node: { id: true } } } });
});

describe('submit-client-brief handler', () => {
  it('returns unauthorized without secret', async () => {
    const result = await handler({ body: baseInput(), headers: {} });
    expect(result).toEqual({ ok: false, reason: 'unauthorized' });
  });

  it('creates an unlisted opportunity with marketplace brief name suffix', async () => {
    const input = baseInput({
      requirements: 'French UI',
      hostingType: 'CLOUD',
      seatCount: '~30',
    });
    const result = await handler(authedEvent(input));
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    await trackCreatedOpportunity(result.opportunityId);

    const fetched = await client.query({
      opportunity: {
        __args: { filter: { id: { eq: result.opportunityId } } },
        id: true,
        name: true,
        need: true,
        requirements: true,
        isListed: true,
        stage: true,
        company: { id: true, name: true },
        pointOfContact: { id: true, emails: { primaryEmail: true } },
      },
    });

    const opp = fetched.opportunity;
    expect(opp?.name).toBe(`${input.companyName} — marketplace brief`);
    expect(opp?.need).toBe(input.need);
    expect(opp?.requirements).toContain('French UI');
    expect(opp?.requirements).toContain('Additional context:');
    expect(opp?.isListed).toBe(false);
    expect(opp?.stage).toBe('NEW');
    expect(opp?.company?.name).toBe(input.companyName);
    expect(opp?.pointOfContact?.emails?.primaryEmail).toBe(input.email);
  });

  it('creates a second opportunity for the same company with different need', async () => {
    const companyName = `Repeat Co ${Date.now()}`;
    const email = `repeat.${Date.now()}@example.com`;
    const first = await handler(authedEvent(baseInput({ companyName, email, need: 'Project A' })));
    const second = await handler(authedEvent(baseInput({ companyName, email, need: 'Project B' })));
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect(first.opportunityId).not.toBe(second.opportunityId);
    await trackCreatedOpportunity(first.opportunityId);
    await trackCreatedOpportunity(second.opportunityId);
  });
});
