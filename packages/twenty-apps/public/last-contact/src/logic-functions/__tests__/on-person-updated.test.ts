import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import onPersonUpdated from '../on-person-updated';

const OLD_COMPANY_ID = '11111111-1111-1111-1111-111111111111';
const NEW_COMPANY_ID = '22222222-2222-2222-2222-222222222222';

const handler = onPersonUpdated.config.handler as (
  batch: unknown,
) => Promise<void>;

const buildBatch = (
  moves: { before: string | null; after: string | null }[],
) => ({
  name: 'person.updated',
  events: moves.map(({ before, after }, index) => ({
    recordId: `person-${index}`,
    properties: {
      updatedFields: ['companyId'],
      before: { id: `person-${index}`, companyId: before },
      after: { id: `person-${index}`, companyId: after },
    },
  })),
});

beforeEach(() => {
  queryMock.mockReset();
  queryMock.mockImplementation((query) =>
    query.companies
      ? Promise.resolve({
          companies: {
            edges: query.companies.__args.filter.id.in.map((id: string) => ({
              node: { id },
            })),
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        })
      : Promise.resolve({
          people: {
            edges: [],
            pageInfo: { hasNextPage: false, endCursor: null },
          },
        }),
  );
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

const updatedCompanyIds = () =>
  mutationMock.mock.calls.flatMap(([mutation]) =>
    mutation.createCompanies.__args.data.map(
      (record: { id: string }) => record.id,
    ),
  );

describe('on-person-updated definition', () => {
  it('should batch companyId updates', () => {
    expect(onPersonUpdated.success).toBe(true);
    expect(onPersonUpdated.config.databaseEventTriggerSettings).toEqual({
      eventName: 'person.updated',
      updatedFields: ['companyId'],
      batchMode: true,
    });
  });
});

describe('on-person-updated handler', () => {
  it('recomputes both the former and the current company', async () => {
    await handler(
      buildBatch([{ before: OLD_COMPANY_ID, after: NEW_COMPANY_ID }]),
    );

    expect(updatedCompanyIds()).toEqual([OLD_COMPANY_ID, NEW_COMPANY_ID]);
  });

  it('recomputes a single company when the person only gains one', async () => {
    await handler(buildBatch([{ before: null, after: NEW_COMPANY_ID }]));

    expect(updatedCompanyIds()).toEqual([NEW_COMPANY_ID]);
  });

  it('recomputes a company shared by several people in the batch only once', async () => {
    await handler(
      buildBatch([
        { before: OLD_COMPANY_ID, after: NEW_COMPANY_ID },
        { before: OLD_COMPANY_ID, after: NEW_COMPANY_ID },
      ]),
    );

    expect(updatedCompanyIds()).toEqual([OLD_COMPANY_ID, NEW_COMPANY_ID]);
  });

  it('does nothing when no company is involved', async () => {
    await handler(buildBatch([{ before: null, after: null }]));

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
