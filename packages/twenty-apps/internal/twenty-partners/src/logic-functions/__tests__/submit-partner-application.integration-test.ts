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
    await client.mutation({ destroyPartner: { __args: { id }, id: true } }).catch(() => {});
  }
  for (const id of createdPersonIds.splice(0)) {
    await client.mutation({ destroyPerson: { __args: { id }, id: true } }).catch(() => {});
  }
  for (const id of createdCompanyIds.splice(0)) {
    await client.mutation({ destroyCompany: { __args: { id }, id: true } }).catch(() => {});
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
  });
  const node = fetched.partner;
  if (!node) return;
  if (node.company) createdCompanyIds.push(node.company.id);
  for (const edge of node.persons?.edges ?? []) createdPersonIds.push(edge.node.id);
}

beforeAll(async () => {
  await client.query({ partners: { __args: { first: 1 }, edges: { node: { id: true } } } });
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
    });
    const node = partner.partner;
    expect(node?.name).toBe('YC Agency');
    expect(node?.slug).toBe('yc-agency');
    expect(node?.validationStage).toBe('APPLICATION');
    expect(node?.reviewed).toBe(false);
    expect(node?.partnerTier).toBe('NEW');
    expect(node?.company?.name).toBe('YC Agency');
    expect(node?.persons?.edges).toHaveLength(1);
    const personNode = node?.persons?.edges?.[0]?.node;
    expect(personNode?.emails?.primaryEmail).toBe('create.case@example.com');
    expect(personNode?.name?.firstName).toBe('Ada');
    expect(personNode?.name?.lastName).toBe('Lovelace');
  });

  it('reuses an existing company for a protocol/www/case domain variant instead of failing on the unique domain index', async () => {
    // A company with this domain already exists (e.g. seeded by the TFT import,
    // with no Partner/Person attached). Company.domainName is uniquely indexed,
    // so a blind createCompany would throw "duplicate entry" and the whole
    // submission would 502. The applicant submits a www/case/trailing-slash
    // variant of the same real domain — the handler must still reuse the
    // existing company via normalized-host matching.
    const storedDomain = 'https://reuse-domain-case.example.com';
    const submittedVariant = 'https://www.Reuse-Domain-Case.example.com/';
    const created = await client.mutation({
      createCompany: {
        __args: { data: { name: 'Pre-existing Co', domainName: { primaryLinkUrl: storedDomain } } },
        id: true,
      },
    });
    const existingCompanyId = created.createCompany?.id;
    expect(existingCompanyId).toBeDefined();
    if (existingCompanyId === undefined) return;
    createdCompanyIds.push(existingCompanyId);

    const result = await handler(
      authedEvent(
        baseInput({
          email: 'reuse.domain@example.com',
          companyName: 'Applicant Co',
          domainName: submittedVariant,
        }),
      ),
    );
    await trackCreated(result);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.created).toBe(true);

    const partner = await client.query({
      partner: {
        __args: { filter: { id: { eq: result.partnerId } } },
        company: { id: true, name: true },
      },
    });
    // Reused the existing company (same id) and left its name untouched.
    expect(partner.partner?.company?.id).toBe(existingCompanyId);
    expect(partner.partner?.company?.name).toBe('Pre-existing Co');
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
          partnerScope: ['ADVISORY', 'SOLUTIONING'],
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
        typeOfTeam: true,
        hourlyRate: { amountMicros: true, currencyCode: true },
      },
    });
    const node = partner.partner;
    expect(node?.city).toBe('Paris');
    expect(node?.partnerScope).toEqual(['ADVISORY', 'SOLUTIONING']);
    expect(node?.typeOfTeam).toBe('SOLO');
    expect(node?.hourlyRate).toEqual({ amountMicros: 175_000_000, currencyCode: 'USD' });
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
    });

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
    });
    const node = partner.partner;
    expect(node?.validationStage).toBe('VALIDATED');
    expect(node?.reviewed).toBe(true);
    expect(node?.ranking).toBe('RATING_4');
    expect(node?.city).toBe('Berlin');
  });

  it('accepts new category values and stores applicationNotes', async () => {
    const result = await handler(
      authedEvent(
        baseInput({
          email: 'cat.test@example.com',
          partnerScope: ['ADVISORY', 'SOLUTIONING'],
          applicationNotes: 'Workspace https://app.twenty.com/ws · refs: Acme',
        }),
      ),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    await trackCreated(result);

    const fetched = await client.query({
      partner: {
        __args: { filter: { id: { eq: result.partnerId } } },
        partnerScope: true,
        applicationNotes: true,
      },
    });
    const node = fetched.partner;
    expect(node?.partnerScope).toEqual(
      expect.arrayContaining(['ADVISORY', 'SOLUTIONING']),
    );
    expect(node?.applicationNotes).toContain('Acme');
  });

  it('rejects a legacy scope value as invalid_input', async () => {
    const result = await handler(
      authedEvent(baseInput({ email: 'legacy@example.com', partnerScope: ['APPS'] })),
    );
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('invalid_input');
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
