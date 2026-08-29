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
  event: unknown,
) => Promise<void>;

const buildEvent = (before: string | null, after: string | null) => ({
  recordId: 'person-1',
  properties: {
    updatedFields: ['companyId'],
    before: { id: 'person-1', companyId: before },
    after: { id: 'person-1', companyId: after },
  },
});

beforeEach(() => {
  queryMock.mockReset();
  queryMock.mockResolvedValue({ people: { edges: [] } });
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

describe('on-person-updated definition', () => {
  it('should trigger on companyId updates', () => {
    expect(onPersonUpdated.success).toBe(true);
    expect(onPersonUpdated.config.databaseEventTriggerSettings).toEqual({
      eventName: 'person.updated',
      updatedFields: ['companyId'],
    });
  });
});

describe('on-person-updated handler', () => {
  it('recomputes both the former and the current company', async () => {
    await handler(buildEvent(OLD_COMPANY_ID, NEW_COMPANY_ID));

    const updatedCompanyIds = mutationMock.mock.calls.map(
      ([mutation]) => mutation.updateCompany.__args.id,
    );
    expect(updatedCompanyIds).toEqual([OLD_COMPANY_ID, NEW_COMPANY_ID]);
  });

  it('recomputes a single company when the person only gains one', async () => {
    await handler(buildEvent(null, NEW_COMPANY_ID));

    expect(mutationMock).toHaveBeenCalledTimes(1);
    expect(mutationMock.mock.calls[0][0].updateCompany.__args.id).toBe(
      NEW_COMPANY_ID,
    );
  });

  it('does nothing when no company is involved', async () => {
    await handler(buildEvent(null, null));

    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
