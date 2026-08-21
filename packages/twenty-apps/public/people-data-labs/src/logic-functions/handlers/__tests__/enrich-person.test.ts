import { beforeEach, describe, expect, it, vi } from 'vitest';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { UPDATE_FIELDS_OPTIONS } from 'src/constants/update-fields-options';
import { createCoreApiClientMock } from 'src/logic-functions/__mocks__/create-core-api-client-mock';
import { PERSON_NODE_MOCK } from 'src/logic-functions/__mocks__/person-node.mock';
import { enrichPersonCore } from 'src/logic-functions/handlers/enrich-person';
import { enrichPerson } from 'src/logic-functions/utils/enrich-person';
import { type PersonNode } from 'src/types/person-node';

vi.mock('src/logic-functions/utils/enrich-person', () => ({
  enrichPerson: vi.fn(),
}));

const enrichPersonMock = vi.mocked(enrichPerson);

type Captured = {
  updatePerson?: Record<string, unknown>;
  updatePeople?: { filter: unknown; data: Record<string, unknown> };
};

type MutationRequest = {
  updatePerson?: { __args: { id: string; data: Record<string, unknown> } };
  updatePeople?: { __args: { filter: unknown; data: Record<string, unknown> } };
};

const captureMutation = (captured: Captured) => (request: unknown) => {
  const mutation = request as MutationRequest;
  if (mutation.updatePerson) {
    captured.updatePerson = mutation.updatePerson.__args.data;
  }
  if (mutation.updatePeople) {
    captured.updatePeople = {
      filter: mutation.updatePeople.__args.filter,
      data: mutation.updatePeople.__args.data,
    };
  }
};

const buildClient = (people: PersonNode[], captured: Captured): CoreApiClient =>
  createCoreApiClientMock({
    queryResult: { people: { edges: people.map((node) => ({ node })) } },
    onMutation: captureMutation(captured),
  });

const runOne = (client: CoreApiClient, recordId = 'p1') =>
  enrichPersonCore({ input: { recordId }, client });

beforeEach(() => {
  enrichPersonMock.mockReset();
});

describe('enrichPersonCore', () => {
  it('fills empty standard fields and writes pdl metadata via updatePerson on a match', async () => {
    enrichPersonMock.mockResolvedValue([
      {
        outcome: 'matched',
        httpStatus: 200,
        likelihood: 8,
        data: {
          id: 'pdl1',
          first_name: 'Jane',
          last_name: 'Doe',
          job_title: 'CEO',
        },
      },
    ]);
    const captured: Captured = {};
    const client = buildClient([PERSON_NODE_MOCK], captured);

    const result = await runOne(client);

    expect(enrichPersonMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('MATCHED');
    expect(result.success).toBe(true);
    expect(result.recordId).toBe('p1');
    expect(captured.updatePerson?.name).toEqual({
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(captured.updatePerson?.jobTitle).toBe('CEO');
    expect(captured.updatePerson?.pdlEnrichmentStatus).toBe('MATCHED');
    expect(captured.updatePerson?.pdlLikelihood).toBe(8);
  });

  it('records NOT_FOUND and writes the status via updatePeople', async () => {
    enrichPersonMock.mockResolvedValue([{ outcome: 'not_found', httpStatus: 404 }]);
    const captured: Captured = {};
    const client = buildClient([PERSON_NODE_MOCK], captured);

    const result = await runOne(client);

    expect(result.status).toBe('NOT_FOUND');
    expect(captured.updatePerson).toBeUndefined();
    expect(captured.updatePeople?.data.pdlEnrichmentStatus).toBe('NOT_FOUND');
    expect(captured.updatePeople?.filter).toEqual({ id: { in: ['p1'] } });
  });

  it('records ERROR and reports failure on a PDL error', async () => {
    enrichPersonMock.mockResolvedValue([
      { outcome: 'error', httpStatus: 500, message: 'boom' },
    ]);
    const captured: Captured = {};
    const client = buildClient([PERSON_NODE_MOCK], captured);

    const result = await runOne(client);

    expect(result.status).toBe('ERROR');
    expect(result.success).toBe(false);
    expect(result.error).toBe('boom');
    expect(captured.updatePeople?.data).toEqual({
      pdlEnrichmentStatus: 'ERROR',
      pdlLastEnrichedAt: expect.any(String),
    });
  });

  it('overwrites a populated standard field when updateFields is "Yes and overwrite"', async () => {
    enrichPersonMock.mockResolvedValue([
      {
        outcome: 'matched',
        httpStatus: 200,
        likelihood: 5,
        data: { id: 'pdl1', job_title: 'CEO' },
      },
    ]);
    const captured: Captured = {};
    const client = buildClient(
      [{ ...PERSON_NODE_MOCK, jobTitle: 'Existing Title' }],
      captured,
    );

    await enrichPersonCore({
      input: { recordId: 'p1', updateFields: UPDATE_FIELDS_OPTIONS.overwrite },
      client,
    });

    expect(captured.updatePerson?.jobTitle).toBe('CEO');
  });

  it('returns enriched data without writing when updateFields is "No"', async () => {
    enrichPersonMock.mockResolvedValue([
      {
        outcome: 'matched',
        httpStatus: 200,
        likelihood: 8,
        data: { id: 'pdl1', first_name: 'Jane', job_title: 'CEO' },
      },
    ]);
    const captured: Captured = {};
    const client = buildClient([PERSON_NODE_MOCK], captured);

    const result = await enrichPersonCore({
      input: { recordId: 'p1', updateFields: UPDATE_FIELDS_OPTIONS.no },
      client,
    });

    expect(result.status).toBe('MATCHED');
    expect(result.updatedFields).toEqual([]);
    expect(result.data?.jobTitle).toBe('CEO');
    expect(captured.updatePerson).toBeUndefined();
    expect(captured.updatePeople).toBeUndefined();
  });

  it('skips when there is no usable identifier', async () => {
    const captured: Captured = {};
    const client = buildClient(
      [{ ...PERSON_NODE_MOCK, linkedinLink: null }],
      captured,
    );

    const result = await runOne(client);

    expect(result.status).toBe('SKIPPED');
    expect(enrichPersonMock).not.toHaveBeenCalled();
  });

  it('marks a missing record as ERROR', async () => {
    const captured: Captured = {};
    const client = buildClient([], captured);

    const result = await runOne(client, 'missing');

    expect(result.status).toBe('ERROR');
    expect(result.error).toBe('Person missing not found');
    expect(enrichPersonMock).not.toHaveBeenCalled();
  });

  it('returns an ERROR without touching PDL when no record id is provided', async () => {
    const captured: Captured = {};
    const client = buildClient([PERSON_NODE_MOCK], captured);

    const result = await enrichPersonCore({ input: {}, client });

    expect(result.status).toBe('ERROR');
    expect(result.error).toBe('No record id was provided to enrich.');
    expect(enrichPersonMock).not.toHaveBeenCalled();
  });
});
