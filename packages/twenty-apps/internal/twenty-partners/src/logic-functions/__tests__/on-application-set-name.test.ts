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

import { handler } from '../on-application-set-name';

const event = (after: Record<string, unknown>, updatedFields: string[]) =>
  ({ properties: { after, updatedFields } }) as never;

describe('on-application-set-name', () => {
  beforeEach(() => {
    queryMock.mockReset();
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({ updateApplication: { id: 'a1' } });
  });

  it('labels the application from partner + opportunity names', async () => {
    queryMock.mockResolvedValue({
      application: {
        id: 'a1',
        partner: { name: 'Acme Partners' },
        opportunity: { name: 'Q3 Renewal' },
      },
    });

    await handler(event({ id: 'a1' }, ['partnerId']));

    expect(mutationMock).toHaveBeenCalledWith({
      updateApplication: {
        __args: { id: 'a1', data: { name: 'Acme Partners · Q3 Renewal' } },
        id: true,
      },
    });
  });

  it('ignores updates that touch neither relation', async () => {
    await handler(event({ id: 'a1' }, ['pitch']));
    expect(queryMock).not.toHaveBeenCalled();
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
