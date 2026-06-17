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

import { handler } from '../on-opportunity-partner-won';

const event = (
  after: Record<string, unknown>,
  before: Record<string, unknown>,
) => ({ properties: { after, before, updatedFields: ['partnerId'] } }) as never;

describe('on-opportunity-partner-won', () => {
  beforeEach(() => {
    queryMock.mockReset();
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({ updateApplication: { id: 'x' } });
  });

  it('does nothing when partnerId did not change', async () => {
    await handler({ properties: { after: { id: 'o1' }, before: {}, updatedFields: ['name'] } } as never);
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('sets the matched application to WON and reverts a prior winner on re-assign', async () => {
    // applications on the opportunity: a1 (new winner, partner p2), a2 (old winner WON, p1)
    queryMock.mockResolvedValue({
      applications: {
        edges: [
          { node: { id: 'a1', partnerId: 'p2', state: 'APPLIED' } },
          { node: { id: 'a2', partnerId: 'p1', state: 'WON' } },
        ],
      },
    });

    await handler(event({ id: 'o1', partnerId: 'p2' }, { partnerId: 'p1' }));

    // a2 reverted off WON, a1 set to WON
    expect(mutationMock).toHaveBeenCalledWith({
      updateApplication: { __args: { id: 'a2', data: { state: 'INTRODUCED' } }, id: true },
    });
    expect(mutationMock).toHaveBeenCalledWith({
      updateApplication: { __args: { id: 'a1', data: { state: 'WON' } }, id: true },
    });
  });

  it('reverts the WON application on unassign', async () => {
    queryMock.mockResolvedValue({
      applications: { edges: [{ node: { id: 'a2', partnerId: 'p1', state: 'WON' } }] },
    });

    await handler(event({ id: 'o1', partnerId: null }, { partnerId: 'p1' }));

    expect(mutationMock).toHaveBeenCalledWith({
      updateApplication: { __args: { id: 'a2', data: { state: 'INTRODUCED' } }, id: true },
    });
  });
});
