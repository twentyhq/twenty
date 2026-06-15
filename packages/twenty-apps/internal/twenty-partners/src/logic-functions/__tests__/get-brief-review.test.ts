import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock } = vi.hoisted(() => ({ queryMock: vi.fn() }));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(() => ({ query: queryMock })),
}));

import { handler } from '../get-brief-review.logic-function';

const BRIEF = { id: 'b1', name: 'Brief Sunrise', need: 'n', requirements: 'r', status: 'OPEN' };

beforeEach(() => queryMock.mockReset());

describe('get-brief-review', () => {
  it('returns NOT_FOUND when no brief matches the token', async () => {
    queryMock.mockResolvedValueOnce({ briefs: { edges: [] } });
    const res = await handler({ queryStringParameters: { token: 'nope' } });
    expect(res).toEqual({ ok: false, reason: 'NOT_FOUND' });
  });

  it('returns the brief, its candidates, and the picked id', async () => {
    queryMock
      .mockResolvedValueOnce({ briefs: { edges: [{ node: BRIEF }] } })
      .mockResolvedValueOnce({
        applications: {
          edges: [
            { node: { id: 'a1', state: 'APPLIED', pitch: 'p1', partnerId: 'p1id' } },
            { node: { id: 'a2', state: 'INTRODUCED', pitch: 'p2', partnerId: 'p2id' } },
          ],
        },
      })
      .mockResolvedValueOnce({ partner: { name: 'Acme', skills: ['x'], country: 'FRANCE' } })
      .mockResolvedValueOnce({ partner: { name: 'Beta', skills: [], country: 'SPAIN' } });

    const res = await handler({ queryStringParameters: { token: 'tok' } });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.brief.name).toBe('Brief Sunrise');
    expect(res.candidates).toHaveLength(2);
    expect(res.candidates[0].partner?.name).toBe('Acme');
    expect(res.picked).toBe('a2');
  });
});
