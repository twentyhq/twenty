import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  runWithStudioScheduleGuard,
  type StudioScheduleChange,
} from '../studio-schedule-guard.ts';

type Row = Record<string, unknown>;
type Filter = { and?: Filter[]; or?: Filter[] } & Record<string, unknown>;
type Selection = Record<
  string,
  { __args: { filter?: Filter; data?: Row; first?: number } }
>;
class ScheduleClient {
  operations: Row[] = [];
  sessions: Row[] = [];
  loseReleaseReply = false;
  failRelease = false;
  failInventory = false;
  private matches(row: Row, filter: Filter = {}): boolean {
    if (filter.and) return filter.and.every((item) => this.matches(row, item));
    if (filter.or) return filter.or.some((item) => this.matches(row, item));
    return Object.entries(filter).every(([key, raw]) => {
      const condition = raw as Row;
      if (condition.is === 'NULL') return row[key] === null;
      if ('eq' in condition) return row[key] === condition.eq;
      if ('neq' in condition) return row[key] !== condition.neq;
      if ('lt' in condition) return String(row[key]) < String(condition.lt);
      if ('gt' in condition) return String(row[key]) > String(condition.gt);
      return false;
    });
  }
  async query(selection: Selection) {
    const [object, { __args: args }] = Object.entries(selection)[0];
    if (object === 'classSessions' && this.failInventory)
      throw Error('unavailable');
    const rows = (
      object === 'classSessions' ? this.sessions : this.operations
    ).filter((row) => this.matches(row, args.filter));
    return {
      [object]: {
        edges: rows
          .slice(0, args.first ?? 1000)
          .map((node) => ({ node: { ...node } })),
        pageInfo: { hasNextPage: rows.length > (args.first ?? 1000) },
      },
    };
  }
  async mutation(selection: Selection) {
    const [operation, { __args: args }] = Object.entries(selection)[0];
    if (operation === 'createStudioSessionOperation') {
      if (this.operations.some((row) => row.id === args.data?.id))
        throw Error('duplicate');
      this.operations.push({ ...args.data });
      return { createStudioSessionOperation: { id: args.data?.id } };
    }
    const release = args.data?.state === 'PREPARED';
    if (release && this.failRelease) throw Error('release failed');
    const matching = this.operations.filter((row) =>
      this.matches(row, args.filter),
    );
    for (const row of matching) Object.assign(row, args.data);
    if (release && this.loseReleaseReply) throw Error('reply lost');
    return {
      updateStudioSessionOperations: matching.map((row) => ({ ...row })),
    };
  }
  asClient() {
    return this as unknown as CoreApiClient;
  }
}
const change = (key = 'one'): StudioScheduleChange => ({
  kind: 'create',
  recordingKey: `session-create:${key}`,
  startsAt: '2099-10-30T09:00:00.000Z',
  endsAt: '2099-10-30T09:55:00.000Z',
});
const row = {
  id: 'session-one',
  status: 'PLANNED',
  recordingKey: 'session-create:one',
  startsAt: '2099-10-30T09:00:00.000Z',
  endsAt: '2099-10-30T09:55:00.000Z',
};

test('overlap is rejected after the first schedule write and the gate is released', async () => {
  const client = new ScheduleClient();
  const first = await runWithStudioScheduleGuard(
    change(),
    async () => {
      client.sessions.push(row);
      return { success: true };
    },
    client.asClient(),
  );
  assert.equal(first.success, true);
  let calls = 0;
  const second = await runWithStudioScheduleGuard(
    change('two'),
    async () => {
      calls++;
      return { success: true };
    },
    client.asClient(),
  );
  assert.equal(second.success, false);
  assert.equal('code' in second && second.code, 'SESSION_SCHEDULE_CONFLICT');
  assert.equal(calls, 0);
  assert.equal(client.operations[0].state, 'PREPARED');
  assert.equal(client.operations[0].ownerToken, null);
});

test('adjacent intervals and cancelled sessions do not block creation', async () => {
  const client = new ScheduleClient();
  client.sessions.push(
    { ...row, endsAt: '2099-10-30T09:00:00.000Z' },
    { ...row, id: 'cancelled', status: 'CANCELLED_BY_STUDIO' },
  );
  assert.equal(
    (
      await runWithStudioScheduleGuard(
        change('two'),
        async () => ({ success: true }),
        client.asClient(),
      )
    ).success,
    true,
  );
});

test('an existing creation key delegates to the original idempotency checks', async () => {
  const client = new ScheduleClient();
  client.sessions.push(row);
  let calls = 0;
  const result = await runWithStudioScheduleGuard(
    change(),
    async () => {
      calls++;
      return { success: true, duplicate: true };
    },
    client.asClient(),
  );
  assert.equal(result.success, true);
  assert.equal(calls, 1);
});

test('an update excludes its own session and rejects a different overlapping session', async () => {
  const client = new ScheduleClient();
  client.sessions.push(row);
  const target = {
    kind: 'update' as const,
    classSessionId: row.id,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
  };
  assert.equal(
    (
      await runWithStudioScheduleGuard(
        target,
        async () => ({ success: true }),
        client.asClient(),
      )
    ).success,
    true,
  );
  client.sessions.push({ ...row, id: 'other' });
  assert.equal(
    (
      await runWithStudioScheduleGuard(
        target,
        async () => ({ success: true }),
        client.asClient(),
      )
    ).success,
    false,
  );
});

test('concurrent different keys cannot both enter the schedule mutation', async () => {
  const client = new ScheduleClient();
  let calls = 0;
  const execute = async () => {
    calls++;
    await new Promise<void>((resolve) => setImmediate(resolve));
    client.sessions.push(row);
    return { success: true };
  };
  const results = await Promise.all([
    runWithStudioScheduleGuard(change(), execute, client.asClient()),
    runWithStudioScheduleGuard(change('two'), execute, client.asClient()),
  ]);
  assert.equal(results.filter((result) => result.success).length, 1);
  assert.equal(calls, 1);
  const later = await runWithStudioScheduleGuard(
    change('two'),
    execute,
    client.asClient(),
  );
  assert.equal('code' in later && later.code, 'SESSION_SCHEDULE_CONFLICT');
  assert.equal(calls, 1);
});

test('a request whose schedule write is uncertain retains the gate without age-based takeover', async () => {
  const client = new ScheduleClient();
  const first = await runWithStudioScheduleGuard(
    change(),
    async () => {
      throw Error('lost schedule response');
    },
    client.asClient(),
  );
  assert.equal(first.success, false);
  assert.equal(client.operations[0].state, 'NEEDS_REVIEW');
  let calls = 0;
  const next = await runWithStudioScheduleGuard(
    change('two'),
    async () => {
      calls++;
      return { success: true };
    },
    client.asClient(),
  );
  assert.equal(next.success, false);
  assert.equal(calls, 0);
});

test('a lost release reply is confirmed by readback; a failed release is not success', async () => {
  const client = new ScheduleClient();
  client.loseReleaseReply = true;
  assert.equal(
    (
      await runWithStudioScheduleGuard(
        change(),
        async () => ({ success: true }),
        client.asClient(),
      )
    ).success,
    true,
  );
  client.loseReleaseReply = false;
  client.failRelease = true;
  assert.equal(
    (
      await runWithStudioScheduleGuard(
        change('two'),
        async () => ({ success: true }),
        client.asClient(),
      )
    ).success,
    false,
  );
});

test('incomplete schedule inventory fails closed without running the business command', async () => {
  const client = new ScheduleClient();
  client.failInventory = true;
  let calls = 0;
  assert.equal(
    (
      await runWithStudioScheduleGuard(
        change(),
        async () => {
          calls++;
          return { success: true };
        },
        client.asClient(),
      )
    ).success,
    false,
  );
  assert.equal(calls, 0);
  assert.equal(client.operations[0].state, 'NEEDS_REVIEW');
});

test('cross-midnight overlaps are covered by interval comparisons', async () => {
  const client = new ScheduleClient();
  client.sessions.push({
    ...row,
    startsAt: '2099-10-29T23:30:00.000Z',
    endsAt: '2099-10-30T00:30:00.000Z',
  });
  const result = await runWithStudioScheduleGuard(
    {
      kind: 'create',
      recordingKey: 'other',
      startsAt: '2099-10-30T00:15:00.000Z',
      endsAt: '2099-10-30T01:00:00.000Z',
    },
    async () => ({ success: true }),
    client.asClient(),
  );
  assert.equal('code' in result && result.code, 'SESSION_SCHEDULE_CONFLICT');
});
