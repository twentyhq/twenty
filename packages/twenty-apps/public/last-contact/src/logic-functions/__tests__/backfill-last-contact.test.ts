import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  queryMock,
  backfillPeopleMock,
  backfillOpportunitiesMock,
  backfillCompaniesMock,
} = vi.hoisted(() => ({
  queryMock: vi.fn(),
  backfillPeopleMock: vi.fn(),
  backfillOpportunitiesMock: vi.fn(),
  backfillCompaniesMock: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock };
  }),
}));

vi.mock('src/utils/backfill-settings', () => ({
  getBackfillBatchSize: () => 2,
}));

vi.mock('src/utils/backfill-people-last-contact', () => ({
  backfillPeopleLastContact: backfillPeopleMock,
}));

vi.mock('src/utils/backfill-opportunities-last-contact', () => ({
  backfillOpportunitiesLastContact: backfillOpportunitiesMock,
}));

vi.mock('src/utils/backfill-companies-last-contact', () => ({
  backfillCompaniesLastContact: backfillCompaniesMock,
}));

import backfillLastContact from '../backfill-last-contact';

type ConnectionQuery = Record<
  string,
  { __args: { first: number; after?: string } }
>;

const RECORDS_BY_QUERY_FIELD: Record<string, Record<string, unknown>[]> = {
  people: [{ id: 'person-1' }, { id: 'person-2' }, { id: 'person-3' }],
  opportunities: [{ id: 'opportunity-1', pointOfContactId: 'person-1' }],
  companies: [],
};

const handler = backfillLastContact.config.handler as (
  payload: object,
) => Promise<object>;

let events: string[] = [];

const recordBatch =
  (phase: string) =>
  async (_client: unknown, records: (string | { id: string })[]) => {
    await Promise.resolve();
    events.push(
      `backfilled ${phase} ${records
        .map((record) => (typeof record === 'string' ? record : record.id))
        .join(',')}`,
    );
  };

beforeEach(() => {
  events = [];

  queryMock.mockReset();
  queryMock.mockImplementation(async (query: ConnectionQuery) => {
    const [queryField] = Object.keys(query);
    const { first, after } = query[queryField].__args;
    const records = RECORDS_BY_QUERY_FIELD[queryField];
    const start = after === undefined ? 0 : Number(after);
    const page = records.slice(start, start + first);
    const end = start + page.length;

    events.push(`read ${queryField} from ${start}`);

    return {
      [queryField]: {
        edges: page.map((node) => ({ node })),
        pageInfo: { hasNextPage: end < records.length, endCursor: `${end}` },
      },
    };
  });

  backfillPeopleMock.mockReset();
  backfillPeopleMock.mockImplementation(recordBatch('people'));
  backfillOpportunitiesMock.mockReset();
  backfillOpportunitiesMock.mockImplementation(recordBatch('opportunities'));
  backfillCompaniesMock.mockReset();
  backfillCompaniesMock.mockImplementation(recordBatch('companies'));
});

describe('backfill-last-contact', () => {
  it('should backfill every batch within the run, one after the other', async () => {
    await expect(handler({ newVersion: '1.6.0' })).resolves.toEqual({
      outcome: 'completed',
      phases: [
        { phase: 'people', count: 3 },
        { phase: 'opportunities', count: 1 },
        { phase: 'companies', count: 0 },
      ],
    });

    expect(events).toEqual([
      'read people from 0',
      'backfilled people person-1,person-2',
      'read people from 2',
      'backfilled people person-3',
      'read opportunities from 0',
      'backfilled opportunities opportunity-1',
      'read companies from 0',
    ]);
  });

  it('should hand each opportunity to its batch with its point of contact', async () => {
    await handler({ newVersion: '1.6.0' });

    expect(backfillOpportunitiesMock).toHaveBeenCalledWith(expect.anything(), [
      { id: 'opportunity-1', pointOfContactId: 'person-1' },
    ]);
  });
});
