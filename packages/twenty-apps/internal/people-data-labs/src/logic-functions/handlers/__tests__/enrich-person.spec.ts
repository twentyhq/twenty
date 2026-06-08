import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { PERSON_NODE_MOCK } from 'src/logic-functions/__mocks__/person-node.mock';
import { PdlInvalidInputError } from 'src/logic-functions/errors/pdl-invalid-input-error';
import { PdlRecordNotFoundError } from 'src/logic-functions/errors/pdl-record-not-found-error';
import { enrichPersonCore } from 'src/logic-functions/handlers/enrich-person';
import { enrichPerson } from 'src/logic-functions/utils/enrich-person';
import { type PersonNode } from 'src/types/person-node';

vi.mock('src/logic-functions/utils/enrich-person', () => ({ enrichPerson: vi.fn() }));

const enrichPersonMock = vi.mocked(enrichPerson);

type Captured = { data?: Record<string, unknown> };

type MutationRequest = {
  updatePerson: { __args: { data: Record<string, unknown> } };
};

const captureUpdatePerson = (captured: Captured) => (request: unknown) => {
  if ('updatePerson' in (request as object)) {
    captured.data = (request as MutationRequest).updatePerson.__args.data;
  }
};

const buildClient = (node: PersonNode, captured: Captured) =>
  createCoreApiClientMock({
    queryResult: { people: { edges: [{ node }] } },
    onMutation: captureUpdatePerson(captured),
  });

beforeEach(() => {
  enrichPersonMock.mockReset();
});

describe('enrichPersonCore', () => {
  it('fills empty standard fields and always writes pdl metadata on a match', async () => {
    enrichPersonMock.mockResolvedValue({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 8,
      data: {
        id: 'pdl1',
        first_name: 'Jane',
        last_name: 'Doe',
        work_email: 'jane@acme.com',
        job_title: 'CEO',
        linkedin_url: 'https://linkedin.com/in/new',
      },
    });
    const captured: Captured = {};
    const client = buildClient(PERSON_NODE_MOCK, captured);

    const result = await enrichPersonCore({ recordId: 'p1' }, client);

    expect(result.status).toBe('MATCHED');
    expect(result.success).toBe(true);
    expect(captured.data?.name).toEqual({ firstName: 'Jane', lastName: 'Doe' });
    expect(captured.data?.jobTitle).toBe('CEO');
    expect(captured.data?.emails).toMatchObject({ primaryEmail: 'jane@acme.com' });
    expect(captured.data?.pdlEnrichmentStatus).toBe('MATCHED');
    expect(captured.data?.pdlLikelihood).toBe(8);
    expect(typeof captured.data?.pdlLastEnrichedAt).toBe('string');
    expect(captured.data?.pdlRawPayload).toMatchObject({ id: 'pdl1' });
    expect('linkedinLink' in (captured.data ?? {})).toBe(false);
  });

  it('links the standard company (find-or-create) when the person has none', async () => {
    enrichPersonMock.mockResolvedValue({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 8,
      data: {
        id: 'pdl1',
        work_email: 'jane@acme.com',
        job_company_name: 'Acme',
        job_company_website: 'acme.com',
      },
    });
    const captured: Captured = {};
    const client = createCoreApiClientMock({
      queryResult: (request: unknown) =>
        'companies' in (request as object)
          ? { companies: { edges: [] } }
          : { people: { edges: [{ node: PERSON_NODE_MOCK }] } },
      mutationResult: (request: unknown) =>
        'createCompany' in (request as object)
          ? { createCompany: { id: 'co-new' } }
          : {},
      onMutation: captureUpdatePerson(captured),
    });

    await enrichPersonCore({ recordId: 'p1' }, client);

    expect(captured.data?.companyId).toBe('co-new');
  });

  it('does not touch company when the person already has one', async () => {
    enrichPersonMock.mockResolvedValue({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 8,
      data: { id: 'pdl1', work_email: 'jane@acme.com', job_company_name: 'Acme' },
    });
    const captured: Captured = {};
    let companiesQueried = false;
    let createCompanyCalled = false;
    const client = createCoreApiClientMock({
      queryResult: (request: unknown) => {
        if ('companies' in (request as object)) {
          companiesQueried = true;

          return { companies: { edges: [] } };
        }

        return {
          people: {
            edges: [{ node: { ...PERSON_NODE_MOCK, company: { id: 'co-existing' } } }],
          },
        };
      },
      mutationResult: (request: unknown) => {
        if ('createCompany' in (request as object)) {
          createCompanyCalled = true;
        }

        return {};
      },
      onMutation: captureUpdatePerson(captured),
    });

    await enrichPersonCore({ recordId: 'p1' }, client);

    expect(companiesQueried).toBe(false);
    expect(createCompanyCalled).toBe(false);
    expect('companyId' in (captured.data ?? {})).toBe(false);
  });

  it('does not overwrite a populated standard field', async () => {
    enrichPersonMock.mockResolvedValue({
      outcome: 'matched',
      httpStatus: 200,
      likelihood: 5,
      data: { id: 'pdl1', job_title: 'CEO' },
    });
    const captured: Captured = {};
    const client = buildClient(
      { ...PERSON_NODE_MOCK, jobTitle: 'Existing Title' },
      captured,
    );

    await enrichPersonCore({ recordId: 'p1' }, client);

    expect('jobTitle' in (captured.data ?? {})).toBe(false);
  });

  it('records NOT_FOUND without writing field data', async () => {
    enrichPersonMock.mockResolvedValue({ outcome: 'not_found', httpStatus: 404 });
    const captured: Captured = {};
    const client = buildClient(PERSON_NODE_MOCK, captured);

    const result = await enrichPersonCore({ recordId: 'p1' }, client);

    expect(result.status).toBe('NOT_FOUND');
    expect(result.updatedFields).toEqual([]);
    expect(Object.keys(captured.data ?? {}).sort()).toEqual([
      'pdlEnrichmentStatus',
      'pdlLastEnrichedAt',
    ]);
    expect(captured.data?.pdlEnrichmentStatus).toBe('NOT_FOUND');
  });

  it('records ERROR and reports failure on a PDL error', async () => {
    enrichPersonMock.mockResolvedValue({
      outcome: 'error',
      httpStatus: 500,
      message: 'boom',
    });
    const captured: Captured = {};
    const client = buildClient(PERSON_NODE_MOCK, captured);

    const result = await enrichPersonCore({ recordId: 'p1' }, client);

    expect(result.success).toBe(false);
    expect(result.status).toBe('ERROR');
    expect(result.error).toBe('boom');
    expect(captured.data?.pdlEnrichmentStatus).toBe('ERROR');
    expect(Object.keys(captured.data ?? {})).toEqual(['pdlEnrichmentStatus']);
  });

  it('throws a PdlInvalidInputError when recordId is missing', async () => {
    const promise = enrichPersonCore({ recordId: '' }, createCoreApiClientMock());

    await expect(promise).rejects.toBeInstanceOf(PdlInvalidInputError);
    await expect(promise).rejects.toThrow('recordId is required');
    expect(enrichPersonMock).not.toHaveBeenCalled();
  });

  it('throws a PdlRecordNotFoundError when the person does not exist', async () => {
    const client = createCoreApiClientMock({
      queryResult: { people: { edges: [] } },
    });

    const promise = enrichPersonCore({ recordId: 'missing' }, client);

    await expect(promise).rejects.toBeInstanceOf(PdlRecordNotFoundError);
    await expect(promise).rejects.toThrow('Person missing not found');
    expect(enrichPersonMock).not.toHaveBeenCalled();
  });

  it('skips a recently enriched record without calling PDL', async () => {
    const captured: Captured = {};
    const client = buildClient(
      { ...PERSON_NODE_MOCK, pdlLastEnrichedAt: new Date().toISOString() },
      captured,
    );

    const result = await enrichPersonCore({ recordId: 'p1' }, client);

    expect(result.status).toBe('SKIPPED');
    expect(enrichPersonMock).not.toHaveBeenCalled();
    expect(captured.data).toBeUndefined();
  });

  it('skips when there is no usable identifier', async () => {
    const captured: Captured = {};
    const client = buildClient(
      { ...PERSON_NODE_MOCK, linkedinLink: null },
      captured,
    );

    const result = await enrichPersonCore({ recordId: 'p1' }, client);

    expect(result.status).toBe('SKIPPED');
    expect(enrichPersonMock).not.toHaveBeenCalled();
  });
});
