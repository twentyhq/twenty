import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import {
  updateClassSession,
  type UpdateClassSessionInput,
} from '../update-class-session-handler.ts';
import { FakeGatewayClient, input } from './fixtures/booking-gateway-client.ts';

type Selection = Record<
  string,
  {
    __args: { filter?: unknown; data?: Record<string, unknown> };
    edges?: { node?: Record<string, unknown> };
  }
>;
const expected = {
  name: 'Реформер',
  startsAt: '2099-01-01T10:00:00.000Z',
  endsAt: '2099-01-01T11:00:00.000Z',
  sessionFormat: 'GROUP_REFORMER',
  capacity: 4,
  status: 'PLANNED' as const,
  recordingKey: 'session-create:test',
};
const command: UpdateClassSessionInput = {
  classSessionId: input.classSessionId,
  idempotencyKey: 'move',
  expected,
  target: {
    name: 'Новое название',
    startsAt: '2099-01-02T10:00:00.000Z',
    endsAt: '2099-01-02T11:00:00.000Z',
    sessionFormat: expected.sessionFormat,
    capacity: 4,
  },
};
const connection = (nodes: Record<string, unknown>[], hasNextPage = false) => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage },
});
class FakeEditor {
  gateway = new FakeGatewayClient();
  session: Record<string, unknown> = { ...expected, id: input.classSessionId };
  bookings: Record<string, unknown>[] = [];
  events: Record<string, unknown>[] = [];
  updates = 0;
  incomplete = false;
  lostUpdate = false;
  failAudit = false;
  casMiss = false;
  async query(selection: Selection): Promise<unknown> {
    if (selection.classSessions?.edges?.node?.name)
      return {
        classSessions: connection([
          { ...this.session, mutationLock: this.gateway.token },
        ]),
      };
    if (selection.studioBookings)
      return { studioBookings: connection(this.bookings, this.incomplete) };
    if (selection.studioEvents)
      return { studioEvents: connection(this.failAudit ? [] : this.events) };
    return this.gateway.query(
      selection as Parameters<FakeGatewayClient['query']>[0],
    );
  }
  async mutation(selection: Selection): Promise<unknown> {
    if (selection.updateClassSessions?.__args.data?.name) {
      assert.ok(this.gateway.token);
      assert.match(
        JSON.stringify(selection.updateClassSessions.__args.filter),
        /mutationLock/,
      );
      if (this.casMiss) return { updateClassSessions: [] };
      this.updates++;
      Object.assign(this.session, selection.updateClassSessions.__args.data);
      if (this.lostUpdate) throw Error('Lost update response');
      return {
        updateClassSessions: [
          { ...this.session, mutationLock: this.gateway.token },
        ],
      };
    }
    if (selection.createStudioEvent) {
      this.events.push({ ...selection.createStudioEvent.__args.data });
      return { createStudioEvent: { id: this.events[0].id } };
    }
    return this.gateway.mutation(
      selection as Parameters<FakeGatewayClient['mutation']>[0],
    );
  }
  client() {
    return this as unknown as CoreApiClient;
  }
}
const booking = {
  id: input.personId,
  status: 'BOOKED',
  classSession: { id: input.classSessionId },
  membership: null,
};
test('guarded edit confirms target and audit then replays without a second update', async () => {
  const fake = new FakeEditor();
  fake.bookings = [booking];
  assert.deepEqual(await updateClassSession(command, fake.client()), {
    success: true,
    duplicate: false,
    classSessionId: input.classSessionId,
  });
  assert.deepEqual(await updateClassSession(command, fake.client()), {
    success: true,
    duplicate: true,
    classSessionId: input.classSessionId,
  });
  assert.equal(fake.updates, 1);
  assert.equal(fake.events.length, 1);
  assert.equal(fake.gateway.token, null);
});
test('stale snapshot releases ownership without modifying the session', async () => {
  const fake = new FakeEditor();
  fake.session.name = 'User changed';
  const result = await updateClassSession(command, fake.client());
  assert.ok(!result.success && result.code === 'SESSION_SNAPSHOT_CONFLICT');
  assert.equal(fake.updates, 0);
  assert.equal(fake.gateway.token, null);
});
test('booked participants prevent incompatible format, duration or reduced capacity', async () => {
  for (const target of [
    { ...command.target, sessionFormat: 'MAT_PILATES' },
    { ...command.target, endsAt: '2099-01-02T11:30:00.000Z' },
    { ...command.target, capacity: 1 },
  ]) {
    const fake = new FakeEditor();
    fake.bookings = [booking, { ...booking, id: input.membershipId }];
    const result = await updateClassSession(
      { ...command, target },
      fake.client(),
    );
    assert.ok(
      !result.success && result.code === 'SESSION_BOOKINGS_INCOMPATIBLE',
    );
    assert.equal(fake.updates, 0);
  }
});
test('reschedule cannot move a booked visit beyond membership expiration', async () => {
  const fake = new FakeEditor();
  fake.bookings = [
    {
      ...booking,
      membership: {
        id: input.membershipId,
        activatedAt: '2098-01-01T00:00:00.000Z',
        expiresOn: '2099-01-01',
      },
    },
  ];
  const result = await updateClassSession(command, fake.client());
  assert.ok(
    !result.success && result.code === 'SESSION_MEMBERSHIP_DATE_CONFLICT',
  );
  assert.equal(fake.updates, 0);
});
test('incomplete inventory fails closed before schedule write', async () => {
  const fake = new FakeEditor();
  fake.incomplete = true;
  assert.equal(
    (await updateClassSession(command, fake.client())).success,
    false,
  );
  assert.equal(fake.updates, 0);
  assert.notEqual(fake.gateway.token, null);
});
test('lost CAS response and missing audit preserve ownership without repeat writes', async () => {
  for (const mode of ['lostUpdate', 'failAudit', 'casMiss'] as const) {
    const fake = new FakeEditor();
    fake[mode] = true;
    assert.equal(
      (await updateClassSession(command, fake.client())).success,
      false,
    );
    assert.equal(
      (await updateClassSession(command, fake.client())).success,
      false,
    );
    assert.equal(fake.updates, mode === 'casMiss' ? 0 : 1);
    assert.notEqual(fake.gateway.token, null);
    assert.equal(fake.gateway.operations[0].state, 'NEEDS_REVIEW');
  }
});

test('terminal edit receipt remains replayable after the scheduled start', async () => {
  const fake = new FakeEditor();
  assert.equal(
    (await updateClassSession(command, fake.client())).success,
    true,
  );
  const result = await updateClassSession(
    command,
    fake.client(),
    new Date('2100-01-01T00:00:00.000Z'),
  );
  assert.deepEqual(result, {
    success: true,
    duplicate: true,
    classSessionId: input.classSessionId,
  });
  assert.equal(fake.updates, 1);
});
