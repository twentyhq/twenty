import { CoreApiClient } from 'twenty-client-sdk/core';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  handler,
  type SubmitPartnerApplicationInput,
  type SubmitPartnerApplicationResult,
} from '../submit-partner-application.logic-function';

const TEST_SECRET = 'test-secret-abc123';
process.env.PARTNER_APPLICATION_SECRET = TEST_SECRET;

const client = new CoreApiClient();

const baseInput = (overrides: Partial<SubmitPartnerApplicationInput> = {}): SubmitPartnerApplicationInput => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada.test@example.com',
  companyName: 'Analytical Engines Ltd',
  ...overrides,
});

const authedEvent = (input: SubmitPartnerApplicationInput) => ({
  body: input,
  headers: { 'x-application-secret': TEST_SECRET },
});

const createdPartnerIds: string[] = [];
const createdPersonIds: string[] = [];
const createdCompanyIds: string[] = [];

async function cleanup(): Promise<void> {
  for (const id of createdPartnerIds.splice(0)) {
    await client.mutation({ destroyPartner: { __args: { id }, id: true } } as any).catch(() => {});
  }
  for (const id of createdPersonIds.splice(0)) {
    await client.mutation({ destroyPerson: { __args: { id }, id: true } } as any).catch(() => {});
  }
  for (const id of createdCompanyIds.splice(0)) {
    await client.mutation({ destroyCompany: { __args: { id }, id: true } } as any).catch(() => {});
  }
}

async function trackCreated(result: SubmitPartnerApplicationResult): Promise<void> {
  if (!result.ok) return;
  createdPartnerIds.push(result.partnerId);
  const fetched = await client.query({
    partner: {
      __args: { filter: { id: { eq: result.partnerId } } },
      id: true,
      company: { id: true },
      persons: { edges: { node: { id: true } } },
    },
  } as any);
  const node = (fetched as any).partner as
    | { id: string; company: { id: string } | null; persons: { edges: Array<{ node: { id: string } }> } }
    | null;
  if (!node) return;
  if (node.company) createdCompanyIds.push(node.company.id);
  for (const edge of node.persons?.edges ?? []) createdPersonIds.push(edge.node.id);
}

beforeAll(async () => {
  await client.query({ partners: { __args: { first: 1 }, edges: { node: { id: true } } } } as any);
});

afterEach(async () => {
  await cleanup();
});

describe('submit-partner-application handler — auth', () => {
  it('returns unauthorized when the x-application-secret header is missing', async () => {
    const result = await handler({ body: baseInput({ email: 'noauth@example.com' }), headers: {} });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('unauthorized');
  });

  it('returns unauthorized when the x-application-secret header is wrong', async () => {
    const result = await handler({
      body: baseInput({ email: 'badauth@example.com' }),
      headers: { 'x-application-secret': 'nope' },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('unauthorized');
  });
});

describe('submit-partner-application handler — upsert', () => {
  it('creates Company, Person, and Partner on first submission and returns created: true', async () => {
    const result = await handler(authedEvent(baseInput({ email: 'create.case@example.com', companyName: 'YC Agency' })));
    await trackCreated(result);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.created).toBe(true);
    expect(result.partnerId).toMatch(/^[0-9a-f-]{36}$/);

    const partner = await client.query({
      partner: {
        __args: { filter: { id: { eq: result.partnerId } } },
        id: true,
        name: true,
        slug: true,
        validationStage: true,
        reviewed: true,
        partnerTier: true,
        company: { id: true, name: true },
        persons: { edges: { node: { id: true, name: { firstName: true, lastName: true }, emails: { primaryEmail: true } } } },
      },
    } as any);
    const node = (partner as any).partner;
    expect(node.name).toBe('YC Agency');
    expect(node.slug).toBe('yc-agency');
    expect(node.validationStage).toBe('APPLICATION');
    expect(node.reviewed).toBe(false);
    expect(node.partnerTier).toBe('NEW');
    expect(node.company?.name).toBe('YC Agency');
    expect(node.persons.edges).toHaveLength(1);
    expect(node.persons.edges[0].node.emails.primaryEmail).toBe('create.case@example.com');
    expect(node.persons.edges[0].node.name.firstName).toBe('Ada');
    expect(node.persons.edges[0].node.name.lastName).toBe('Lovelace');
  });

  it('returns created: false and updates fields on resubmission for the same email', async () => {
    const first = await handler(authedEvent(baseInput({ email: 'update.case@example.com', city: 'London' })));
    await trackCreated(first);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    const second = await handler(
      authedEvent(
        baseInput({
          email: 'update.case@example.com',
          city: 'Paris',
          partnerScope: ['APPS', 'DATA_MODEL'],
          deploymentExpertise: ['CLOUD'],
          typeOfTeam: 'SOLO',
          hourlyRate: 175,
        }),
      ),
    );
    expect(second.ok).toBe(true);
    if (!second.ok) return;
    expect(second.created).toBe(false);
    expect(second.partnerId).toBe(first.partnerId);

    const partner = await client.query({
      partner: {
        __args: { filter: { id: { eq: second.partnerId } } },
        id: true,
        city: true,
        partnerScope: true,
        deploymentExpertise: true,
        typeOfTeam: true,
        hourlyRate: { amountMicros: true, currencyCode: true },
      },
    } as any);
    const node = (partner as any).partner;
    expect(node.city).toBe('Paris');
    expect(node.partnerScope).toEqual(['APPS', 'DATA_MODEL']);
    expect(node.deploymentExpertise).toEqual(['CLOUD']);
    expect(node.typeOfTeam).toBe('SOLO');
    expect(node.hourlyRate).toEqual({ amountMicros: 175_000_000, currencyCode: 'USD' });
  });

  it('preserves staff-owned columns (validationStage, ranking, reviewed) on resubmission', async () => {
    const first = await handler(authedEvent(baseInput({ email: 'staff.preserve@example.com' })));
    await trackCreated(first);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    await client.mutation({
      updatePartner: {
        __args: {
          id: first.partnerId,
          data: { validationStage: 'VALIDATED', reviewed: true, ranking: 'RATING_4' },
        },
        id: true,
      },
    } as any);

    const second = await handler(authedEvent(baseInput({ email: 'staff.preserve@example.com', city: 'Berlin' })));
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    const partner = await client.query({
      partner: {
        __args: { filter: { id: { eq: second.partnerId } } },
        validationStage: true,
        reviewed: true,
        ranking: true,
        city: true,
      },
    } as any);
    const node = (partner as any).partner;
    expect(node.validationStage).toBe('VALIDATED');
    expect(node.reviewed).toBe(true);
    expect(node.ranking).toBe('RATING_4');
    expect(node.city).toBe('Berlin');
  });

  it('writes applicationNotes from workspaceUrl + customerReferences', async () => {
    const result = await handler(
      authedEvent(
        baseInput({
          email: 'notes.case@example.com',
          workspaceUrl: 'https://app.twenty.com/workspaces/ada',
          customerReferences: 'Acme Corp, Globex',
        }),
      ),
    );
    await trackCreated(result);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const partner = await client.query({
      partner: { __args: { filter: { id: { eq: result.partnerId } } }, applicationNotes: true },
    } as any);
    const notes = (partner as any).partner.applicationNotes as string;
    expect(notes).toContain('Workspace URL: https://app.twenty.com/workspaces/ada');
    expect(notes).toContain('Customer references:');
    expect(notes).toContain('Acme Corp, Globex');
  });

  it('returns ok: false on malformed input (empty email)', async () => {
    const result = await handler(
      authedEvent({
        firstName: 'Ada',
        lastName: 'Lovelace',
        email: '',
        companyName: 'Analytical Engines Ltd',
      }),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('invalid_input');
  });
});
