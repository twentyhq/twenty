import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  createClassSession,
  type CreateClassSessionInput,
} from '../create-class-session-handler.ts';

type RecordData = Record<string, unknown>;
type Filter = Record<string, unknown> & { or?: Filter[] };
type Selection = Record<
  string,
  { __args: { filter?: Filter; data?: RecordData; id?: string } }
>;
class FakeClient {
  records: Record<string, RecordData[]> = {
    classSessions: [],
    studioBookings: [],
    studioEvents: [],
    studioMemberships: ['one', 'two'].map((id) => ({
      id: 'membership-' + id,
      personId: 'person-' + id,
      productId: 'product',
      status: 'ACTIVE',
      activatedAt: '2020-01-01T00:00:00.000Z',
      expiresOn: null,
      purchaseIdempotencyKey: 'paid-' + id,
      visitsGranted: 8,
      visitsAvailable: 8,
      visitsReserved: 0,
      visitsConsumed: 0,
    })),
    membershipTransactions: ['one', 'two'].map((id) => ({
      id: 'grant-' + id,
      membershipId: 'membership-' + id,
      transactionType: 'GRANT',
      visitDelta: 8,
      occurredAt: '2020-01-01T00:00:00.000Z',
    })),
  };
  bookingAttempts = 0;
  failSecondBooking = false;
  nextId = 1;
  matches(record: RecordData, filter: Filter = {}): boolean {
    if (filter.or) return filter.or.some((item) => this.matches(record, item));
    return Object.entries(filter).every(
      ([key, value]) => record[key] === (value as { eq: unknown }).eq,
    );
  }
  node(record: RecordData): RecordData {
    const result = { ...record };
    for (const relation of [
      'person',
      'membership',
      'product',
      'classSession',
      'booking',
    ])
      if (record[relation + 'Id'])
        result[relation] = { id: record[relation + 'Id'] };
    if (record.productId)
      result.product = {
        id: record.productId,
        name: 'Пакет',
        category: record.category ?? 'GROUP_PACKAGE',
        sessionFormat: record.format ?? 'GROUP_REFORMER',
        durationMinutes: 55,
      };
    return result;
  }
  async query(selection: Selection) {
    return Object.fromEntries(
      Object.entries(selection).map(([key, { __args: args }]) => [
        key,
        {
          edges: this.records[key]
            .filter((record) => this.matches(record, args.filter))
            .map((record) => ({ node: this.node(record) })),
        },
      ]),
    );
  }
  async mutation(selection: Selection) {
    const [operation, { __args: args }] = Object.entries(selection)[0];
    if (
      operation === 'createStudioBooking' &&
      ++this.bookingAttempts === 2 &&
      this.failSecondBooking
    ) {
      this.failSecondBooking = false;
      throw new Error('Second booking failed');
    }
    const resources: Record<string, string> = {
      createClassSession: 'classSessions',
      createStudioBooking: 'studioBookings',
      createStudioEvent: 'studioEvents',
      createMembershipTransaction: 'membershipTransactions',
      updateClassSession: 'classSessions',
      updateStudioMembership: 'studioMemberships',
    };
    const records = this.records[resources[operation]];
    if (operation.startsWith('update')) {
      const record = records.find((item) => item.id === args.id);
      assert.ok(record);
      Object.assign(record, args.data);
      return { [operation]: this.node(record) };
    }
    const data: RecordData = { id: 'generated-' + this.nextId++, ...args.data };
    if (
      records.some(
        (record) =>
          record.id === data.id ||
          (data.idempotencyKey &&
            record.idempotencyKey === data.idempotencyKey),
      )
    )
      throw new Error('duplicate entry');
    records.push(data);
    return { [operation]: this.node(data) };
  }
  asClient() {
    return this as unknown as CoreApiClient;
  }
}
const input: CreateClassSessionInput = {
  name: 'Группа',
  sessionFormat: 'GROUP_REFORMER',
  startsAt: '2099-01-01T10:00:00Z',
  durationMinutes: 55,
  capacity: 4,
  status: 'PLANNED',
  idempotencyKey: 'session',
  participants: [
    { personId: 'person-one', membershipId: 'membership-one' },
    { personId: 'person-two', membershipId: 'membership-two' },
  ],
};

test('group creation adds selected people, reserves once and journals each action', async () => {
  const client = new FakeClient();
  assert.ok((await createClassSession(input, client.asClient())).success);
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'RESERVE',
    ).length,
    2,
  );
  assert.equal(client.records.studioEvents.length, 3);
  assert.ok((await createClassSession(input, client.asClient())).success);
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(client.records.studioEvents.length, 3);
});
test('partial participant failure recovers unchanged batch without reserving again', async () => {
  const client = new FakeClient();
  client.failSecondBooking = true;
  await assert.rejects(
    createClassSession(input, client.asClient()),
    /Second booking failed/,
  );
  assert.equal(client.records.studioBookings.length, 1);
  const changed = await createClassSession(
    { ...input, participants: [input.participants![1]] },
    client.asClient(),
  );
  assert.ok(!changed.success && changed.code === 'IDEMPOTENCY_CONFLICT');
  assert.ok((await createClassSession(input, client.asClient())).success);
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'RESERVE',
    ).length,
    2,
  );
});
test('personal/group differentiation and eligibility are checked before creating the session', async () => {
  const client = new FakeClient();
  const personal = await createClassSession(
    { ...input, sessionFormat: 'PERSONAL_EQUIPMENT', capacity: 1 },
    client.asClient(),
  );
  assert.ok(!personal.success && personal.code === 'INVALID_PARTICIPANTS');
  const wrong = await createClassSession(
    {
      ...input,
      sessionFormat: 'PERSONAL_EQUIPMENT',
      capacity: 1,
      participants: [input.participants![0]],
    },
    client.asClient(),
  );
  assert.ok(!wrong.success && wrong.code === 'PARTICIPANT_PACKAGE_UNAVAILABLE');
  assert.equal(client.records.classSessions.length, 0);
  client.records.studioMemberships[0].category = 'PERSONAL';
  client.records.studioMemberships[0].format = 'PERSONAL_EQUIPMENT';
  assert.ok(
    (
      await createClassSession(
        {
          ...input,
          sessionFormat: 'PERSONAL_EQUIPMENT',
          capacity: 1,
          participants: [input.participants![0]],
        },
        client.asClient(),
      )
    ).success,
  );
  assert.equal(client.records.studioBookings[0].bookingType, 'PERSONAL');
});
test('historical selected people go through preview and consume, never future reservation', async () => {
  const client = new FakeClient();
  const historical = {
    ...input,
    startsAt: '2026-01-01T10:00:00Z',
    status: 'COMPLETED' as const,
    pastConfirmed: true,
    attendanceReason: 'По журналу посещений',
  };
  assert.ok((await createClassSession(historical, client.asClient())).success);
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'CONSUME',
    ).length,
    2,
  );
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'RESERVE',
    ).length,
    0,
  );
  assert.ok((await createClassSession(historical, client.asClient())).success);
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'CONSUME',
    ).length,
    2,
  );
  assert.equal(client.records.studioEvents.length, 3);
});
