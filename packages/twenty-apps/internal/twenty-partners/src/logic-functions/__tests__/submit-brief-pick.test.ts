import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(() => ({ query: queryMock, mutation: mutationMock })),
}));

import { handler } from '../submit-brief-pick.logic-function';

const SECRET = 'test-secret';
const ok = (applicationId: string) => ({
  headers: { 'x-application-secret': SECRET },
  body: { token: 'tok', applicationId },
});

const mockBriefAndApps = (status = 'OPEN') => {
  queryMock
    .mockResolvedValueOnce({ briefs: { edges: [{ node: { id: 'b1', status } }] } })
    .mockResolvedValueOnce({
      applications: { edges: [{ node: { id: 'a1', state: 'APPLIED' } }, { node: { id: 'a2', state: 'APPLIED' } }] },
    });
};

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset().mockResolvedValue({});
  process.env.PARTNER_APPLICATION_SECRET = SECRET;
});
afterEach(() => { delete process.env.PARTNER_APPLICATION_SECRET; });

describe('submit-brief-pick', () => {
  it('rejects a missing/wrong secret', async () => {
    const res = await handler({ headers: {}, body: { token: 'tok', applicationId: 'a1' } });
    expect(res).toEqual({ ok: false, reason: 'unauthorized' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('returns NOT_FOUND when the token matches no brief', async () => {
    queryMock.mockResolvedValueOnce({ briefs: { edges: [] } });
    const res = await handler(ok('a1'));
    expect(res).toEqual({ ok: false, reason: 'NOT_FOUND' });
  });

  it('rejects a CLOSED brief', async () => {
    queryMock.mockResolvedValueOnce({ briefs: { edges: [{ node: { id: 'b1', status: 'CLOSED' } }] } });
    const res = await handler(ok('a1'));
    expect(res).toEqual({ ok: false, reason: 'CLOSED' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('rejects an applicationId that is not in the brief', async () => {
    mockBriefAndApps();
    const res = await handler(ok('not-mine'));
    expect(res).toEqual({ ok: false, reason: 'FORBIDDEN' });
    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('sets the chosen app INTRODUCED and the other BACKUP', async () => {
    mockBriefAndApps();
    const res = await handler(ok('a1'));
    expect(res).toEqual({ ok: true, picked: 'a1' });
    const calls = mutationMock.mock.calls.map((c) => c[0].updateApplication.__args);
    const a1 = calls.find((a) => a.id === 'a1');
    const a2 = calls.find((a) => a.id === 'a2');
    expect(a1.data.state).toBe('INTRODUCED');
    expect(typeof a1.data.selectedAt).toBe('string');
    expect(a2.data.state).toBe('BACKUP');
  });

  it('skips an already-DECLINED sibling (does not move it to BACKUP)', async () => {
    queryMock
      .mockResolvedValueOnce({ briefs: { edges: [{ node: { id: 'b1', status: 'OPEN' } }] } })
      .mockResolvedValueOnce({
        applications: { edges: [{ node: { id: 'a1', state: 'APPLIED' } }, { node: { id: 'a2', state: 'DECLINED' } }] },
      });
    const res = await handler(ok('a1'));
    expect(res).toEqual({ ok: true, picked: 'a1' });
    const ids = mutationMock.mock.calls.map((c) => c[0].updateApplication.__args.id);
    expect(ids).toContain('a1');
    expect(ids).not.toContain('a2');
  });

  it('is idempotent when the target is already INTRODUCED and skips already-BACKUP siblings', async () => {
    queryMock
      .mockResolvedValueOnce({ briefs: { edges: [{ node: { id: 'b1', status: 'OPEN' } }] } })
      .mockResolvedValueOnce({
        applications: { edges: [{ node: { id: 'a1', state: 'INTRODUCED' } }, { node: { id: 'a2', state: 'BACKUP' } }] },
      });
    const res = await handler(ok('a1'));
    expect(res).toEqual({ ok: true, picked: 'a1' });
    // True no-op: nothing is re-written, so selectedAt is never overwritten.
    expect(mutationMock).not.toHaveBeenCalled();
  });
});
