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

import { handler } from './on-opportunity-partner-won.logic-function';

const OPP = 'aaaaaaaa-0000-0000-0000-000000000001';
const P_WIN = 'bbbbbbbb-0000-0000-0000-000000000001';
const P_OTHER = 'bbbbbbbb-0000-0000-0000-000000000002';

const event = (after: Record<string, unknown>, updatedFields: string[]) =>
  ({ properties: { after, updatedFields } }) as never;

const apps = (...nodes: Array<Record<string, unknown>>) => ({
  applications: { edges: nodes.map((node) => ({ node })) },
});

const stateUpdates = () =>
  mutationMock.mock.calls.map((c) => {
    const a = c[0].updateApplication.__args;
    return { id: a.id, state: a.data.state };
  });

describe('on-opportunity-partner-won cascade', () => {
  beforeEach(() => {
    queryMock.mockReset();
    mutationMock.mockReset();
    mutationMock.mockResolvedValue({ updateApplication: { id: 'x' } });
  });

  it('ignores updates that do not touch partnerId', async () => {
    const result = await handler(
      event({ id: OPP, partnerId: P_WIN }, ['stage']),
    );
    expect(result).toEqual({});
    expect(queryMock).not.toHaveBeenCalled();
  });

  it('on assign: winner -> WON, every other contender -> DECLINED', async () => {
    queryMock.mockResolvedValue(
      apps(
        { id: 'app-win', partnerId: P_WIN, state: 'APPLIED' },
        { id: 'app-other', partnerId: P_OTHER, state: 'APPLIED' },
        { id: 'app-declined', partnerId: 'p3', state: 'DECLINED' },
      ),
    );
    await handler(event({ id: OPP, partnerId: P_WIN }, ['partnerId']));
    const updates = stateUpdates();
    expect(updates).toContainEqual({ id: 'app-win', state: 'WON' });
    expect(updates).toContainEqual({ id: 'app-other', state: 'DECLINED' });
    expect(updates.find((u) => u.id === 'app-declined')).toBeUndefined();
  });

  it('on assign: a losing BACKUP keeps its shortlist state', async () => {
    queryMock.mockResolvedValue(
      apps(
        { id: 'app-win', partnerId: P_WIN, state: 'APPLIED' },
        { id: 'app-bk', partnerId: P_OTHER, state: 'BACKUP' },
      ),
    );
    await handler(event({ id: OPP, partnerId: P_WIN }, ['partnerId']));
    const updates = stateUpdates();
    expect(updates).toContainEqual({ id: 'app-win', state: 'WON' });
    expect(updates.find((u) => u.id === 'app-bk')).toBeUndefined();
  });

  it('on assign: a winner sitting at BACKUP still moves to WON', async () => {
    queryMock.mockResolvedValue(
      apps({ id: 'app-win-was-backup', partnerId: P_WIN, state: 'BACKUP' }),
    );
    await handler(event({ id: OPP, partnerId: P_WIN }, ['partnerId']));
    expect(stateUpdates()).toContainEqual({
      id: 'app-win-was-backup',
      state: 'WON',
    });
  });

  it('on assign: a winner sitting at DECLINED still moves to WON (no longer frozen)', async () => {
    queryMock.mockResolvedValue(
      apps({ id: 'app-win-was-declined', partnerId: P_WIN, state: 'DECLINED' }),
    );
    await handler(event({ id: OPP, partnerId: P_WIN }, ['partnerId']));
    const updates = stateUpdates();
    expect(updates).toContainEqual({
      id: 'app-win-was-declined',
      state: 'WON',
    });
  });

  it('on unassign: only WON -> APPLIED; DECLINED and BACKUP untouched', async () => {
    queryMock.mockResolvedValue(
      apps(
        { id: 'app-win', partnerId: P_WIN, state: 'WON' },
        { id: 'app-declined', partnerId: P_OTHER, state: 'DECLINED' },
        { id: 'app-bk', partnerId: 'p3', state: 'BACKUP' },
      ),
    );
    await handler(event({ id: OPP, partnerId: null }, ['partnerId']));
    const updates = stateUpdates();
    expect(updates).toContainEqual({ id: 'app-win', state: 'APPLIED' });
    expect(updates.find((u) => u.id === 'app-declined')).toBeUndefined();
    expect(updates.find((u) => u.id === 'app-bk')).toBeUndefined();
  });

  it('does not rewrite an app already in its target state', async () => {
    queryMock.mockResolvedValue(
      apps({ id: 'app-win', partnerId: P_WIN, state: 'WON' }),
    );
    await handler(event({ id: OPP, partnerId: P_WIN }, ['partnerId']));
    expect(stateUpdates().find((u) => u.id === 'app-win')).toBeUndefined();
  });
});
