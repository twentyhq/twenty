import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  createClassSession,
  type CreateClassSessionInput,
} from '../create-class-session-handler.ts';

type RecordData = Record<string, unknown>;
type Selection = Record<
  string,
  { __args: { filter?: Record<string, { eq: unknown }>; data?: RecordData } }
>;
class FakeClient {
  records: Record<string, RecordData[]> = {
    studioSessionLocks: [], trainerPayEntries: [],
    studioTrainers: [{ id: 'trainer', active: true }],
    classSessions: [],
    studioEvents: [],
  };
  failOn: string | undefined;
  loseSessionResponse = false;
  async query(selection: Selection) {
    const [key, { __args: args }] = Object.entries(selection)[0];
    return {
      [key]: {
        edges: this.records[key]
          .filter((record) =>
            Object.entries(args.filter ?? {}).every(
              ([field, condition]) => record[field] === condition.eq,
            ),
          )
          .map((node) => ({ node })),
      },
    };
  }
  async mutation(selection: Selection) {
    const lockOperation = Object.entries(selection)[0];
    if (lockOperation[0] === 'createStudioSessionLock') {
      const data = lockOperation[1].__args.data!;
      if (this.records.studioSessionLocks.some((record) => record.name === data.name)) throw new Error('Session locked');
      const record = { id: crypto.randomUUID(), ...data };
      this.records.studioSessionLocks.push(record);
      return { createStudioSessionLock: record };
    }
    if (lockOperation[0] === 'destroyStudioSessionLock') {
      this.records.studioSessionLocks = this.records.studioSessionLocks.filter((record) => record.id !== lockOperation[1].__args.id);
      return { destroyStudioSessionLock: { id: lockOperation[1].__args.id } };
    }
    const [operation, { __args: args }] = Object.entries(selection)[0];
    if (this.failOn === operation) {
      this.failOn = undefined;
      throw new Error('Injected failure');
    }
    const records =
      this.records[
        operation === 'createClassSession' ? 'classSessions' : 'studioEvents'
      ];
    const data = { id: '00000000-0000-4000-8000-000000000001', ...args.data };
    if (records.some((record) => record.id === data.id))
      throw new Error('duplicate entry');
    records.push(data);
    if (operation === 'createClassSession' && this.loseSessionResponse) {
      this.loseSessionResponse = false;
      throw new Error('Lost response');
    }
    return { [operation]: data };
  }
  asClient() {
    return this as unknown as CoreApiClient;
  }
}
const now = new Date('2026-10-14T12:00:00Z');
const input: CreateClassSessionInput = {
  name: 'Реформер',
  sessionFormat: 'GROUP_REFORMER',
  startsAt: '2026-10-15T10:00:00+03:00',
  durationMinutes: 55,
  capacity: 4,
  status: 'PLANNED',
  idempotencyKey: 'create-key',
};

test('generates the canonical format label when no name is supplied', async () => {
  const client = new FakeClient();
  assert.ok((await createClassSession({ ...input, name: undefined }, client.asClient(), now)).success);
  assert.equal(client.records.classSessions[0].name, 'Группа на реформере');
});

test('creates a future session and one required event, without visits or payments', async () => {
  const client = new FakeClient();
  assert.ok((await createClassSession(input, client.asClient(), now)).success);
  assert.equal(
    client.records.classSessions[0].startsAt,
    '2026-10-15T07:00:00.000Z',
  );
  assert.equal(
    client.records.classSessions[0].endsAt,
    '2026-10-15T07:55:00.000Z',
  );
  assert.equal(client.records.classSessions[0].bookedCount, 0);
  assert.equal(client.records.studioEvents[0].eventType, 'SESSION_CREATED');
  const repeated = await createClassSession(
    input,
    client.asClient(),
    new Date('2027-01-01'),
  );
  assert.ok(repeated.success && repeated.duplicate);
  assert.equal(client.records.classSessions.length, 1);
  assert.equal(client.records.studioEvents.length, 1);
});
test('historical session requires confirmation and cannot be completed in future', async () => {
  const client = new FakeClient();
  const past = {
    ...input,
    startsAt: '2026-10-13T10:00:00+03:00',
    status: 'COMPLETED' as const,
  };
  const refused = await createClassSession(past, client.asClient(), now);
  assert.ok(!refused.success && refused.code === 'PAST_CONFIRMATION_REQUIRED');
  const futureCompleted = await createClassSession(
    { ...input, status: 'COMPLETED', pastConfirmed: true },
    client.asClient(),
    now,
  );
  assert.ok(
    !futureCompleted.success &&
      futureCompleted.code === 'SESSION_STATUS_DATE_MISMATCH',
  );
  assert.equal(client.records.classSessions.length, 0);
  assert.ok(
    (
      await createClassSession(
        { ...past, pastConfirmed: true },
        client.asClient(),
        now,
      )
    ).success,
  );
  assert.equal(client.records.classSessions[0].status, 'COMPLETED');
});
test('an ongoing session is confirmed, not completed', async () => {
  const client = new FakeClient();
  assert.ok(
    (
      await createClassSession(
        {
          ...input,
          startsAt: '2026-10-14T11:30:00Z',
          durationMinutes: 60,
          status: 'CONFIRMED',
        },
        client.asClient(),
        now,
      )
    ).success,
  );
  assert.equal(client.records.classSessions[0].status, 'CONFIRMED');
});
test('recovers session or journal failures with the same key', async () => {
  for (const failure of ['session', 'event']) {
    const client = new FakeClient();
    if (failure === 'session') client.loseSessionResponse = true;
    else client.failOn = 'createStudioEvent';
    await assert.rejects(createClassSession(input, client.asClient(), now));
    assert.equal(client.records.classSessions.length, 1);
    assert.ok(
      (await createClassSession(input, client.asClient(), now)).success,
    );
    assert.equal(client.records.classSessions.length, 1);
    assert.equal(client.records.studioEvents.length, 1);
  }
});
test('rejects changed payload or status on replay', async () => {
  const client = new FakeClient();
  await createClassSession(input, client.asClient(), now);
  for (const changed of [
    { name: 'Другая' },
    { capacity: 1 },
    { durationMinutes: 60 },
    { status: 'COMPLETED' as const, pastConfirmed: true },
  ]) {
    const result = await createClassSession(
      { ...input, ...changed },
      client.asClient(),
      now,
    );
    assert.ok(!result.success && result.code === 'IDEMPOTENCY_CONFLICT');
  }
});
test('rejects invalid format, naive time and invalid duration/capacity without writes', async () => {
  const client = new FakeClient();
  for (const changed of [
    { sessionFormat: 'invalid' },
    { startsAt: '2026-10-15T10:00:00' },
    { durationMinutes: 0 },
    { capacity: 1.5 },
  ]) {
    assert.equal(
      (
        await createClassSession(
          { ...input, ...changed },
          client.asClient(),
          now,
        )
      ).success,
      false,
    );
  }
  assert.equal(client.records.classSessions.length, 0);
});

test('creates a session with a catalog trainer and retains the trainer in the creation audit', async () => {
  const client = new FakeClient();
  const request = { ...input, trainerId: 'trainer' };
  assert.ok((await createClassSession(request, client.asClient(), now)).success);
  assert.equal(client.records.classSessions[0].trainerId, 'trainer');
  assert.equal(JSON.parse(client.records.studioEvents[0].details as string).trainerId, 'trainer');
  assert.ok((await createClassSession(request, client.asClient(), now)).success);
  const changed = await createClassSession({ ...request, trainerId: 'other' }, client.asClient(), now);
  assert.ok(!changed.success && changed.code === 'IDEMPOTENCY_CONFLICT');
});
test('does not create a class with an inactive catalog trainer', async () => {
  const client = new FakeClient(); client.records.studioTrainers[0].active = false;
  const result = await createClassSession({ ...input, trainerId: 'trainer' }, client.asClient(), now);
  assert.ok(!result.success && result.code === 'TRAINER_NOT_ACTIVE');
  assert.equal(client.records.classSessions.length, 0);
});
