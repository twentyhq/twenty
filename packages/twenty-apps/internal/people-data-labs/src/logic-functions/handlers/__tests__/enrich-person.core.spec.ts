import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { PERSON_NODE_MOCK } from 'src/logic-functions/__mocks__/person-node.mock';
import { enrichPersonCore } from 'src/logic-functions/handlers/enrich-person.core';
import { enrichPerson } from 'src/logic-functions/utils/enrich-person';
import { type PersonNode } from 'src/types/person-node.type';

vi.mock('src/logic-functions/utils/enrich-person', () => ({ enrichPerson: vi.fn() }));

const enrichPersonMock = vi.mocked(enrichPerson);

type Captured = { data?: Record<string, unknown> };

type MutationRequest = {
  updatePerson: { __args: { data: Record<string, unknown> } };
};

const buildClient = (node: PersonNode, captured: Captured) =>
  createCoreApiClientMock({
    queryResult: { people: { edges: [{ node }] } },
    onMutation: (request) => {
      captured.data = (request as MutationRequest).updatePerson.__args.data;
    },
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

  it('throws when recordId is missing', async () => {
    await expect(
      enrichPersonCore({ recordId: '' }, createCoreApiClientMock()),
    ).rejects.toThrow('recordId is required');
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
