import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import { recordPastAttendance } from '../record-past-attendance-handler.ts';

type RecordData = Record<string, unknown>;
type Selection = Record<string, { __args: { filter?: Record<string, { eq: unknown }>; id?: string; data?: RecordData } }>;

class FakeClient {
  records: Record<string, RecordData[]> = {
    studioMemberships: [{
      id: 'membership', status: 'ACTIVE', activatedAt: '2020-01-01T00:00:00.000Z',
      expiresOn: null, purchaseIdempotencyKey: 'purchase',
      visitsGranted: 2, visitsReserved: 0, visitsConsumed: 0, visitsAvailable: 2,
      person: { id: 'person' },
      product: { id: 'product', name: 'Пакет', category: 'GROUP_PACKAGE', sessionFormat: 'GROUP_REFORMER', durationMinutes: 55 },
    }],
    studioBookings: [], classSessions: [], studioEvents: [],
    membershipTransactions: [{ id: 'grant', transactionType: 'GRANT', visitDelta: 2,
      occurredAt: '2020-01-01T00:00:00.000Z', membershipId: 'membership' }],
  };

  async query(selection: Selection) {
    const [key, { __args: args }] = Object.entries(selection)[0];
    const records = this.records[key].filter((record) =>
      Object.entries(args.filter ?? {}).every(([field, value]) => record[field] === value.eq));
    return { [key]: { edges: records.map((node) => ({ node })) } };
  }

  async mutation(selection: Selection) {
    const [operation, { __args: args }] = Object.entries(selection)[0];
    const objects: Record<string, string> = {
      createClassSession: 'classSessions', createStudioBooking: 'studioBookings',
      createMembershipTransaction: 'membershipTransactions',
      createStudioEvent: 'studioEvents',
      updateStudioMembership: 'studioMemberships', updateClassSession: 'classSessions',
    };
    const records = this.records[objects[operation]];
    if (operation.startsWith('update')) {
      const record = records.find(({ id }) => id === args.id);
      assert.ok(record);
      Object.assign(record, args.data);
      return { [operation]: record };
    }
    const record: RecordData = { id: operation + records.length, ...args.data };
    for (const relation of ['person', 'membership', 'product', 'classSession', 'booking']) {
      if (record[relation + 'Id']) record[relation] = { id: record[relation + 'Id'] };
    }
    records.push(record);
    return { [operation]: record };
  }

  asClient() { return this as unknown as CoreApiClient; }
}

const input = {
  personId: 'person', membershipId: 'membership', startsAt: '2021-01-01T10:00:00.000Z',
  endsAt: '2021-01-01T10:55:00.000Z', reason: 'По журналу', source: 'ADMIN' as const,
  idempotencyKey: 'attendance',
};

test('API-key context previews without author and without mutations', async () => {
  const client = new FakeClient();
  const result = await recordPastAttendance({ ...input, previewOnly: true }, { userWorkspaceId: null }, client.asClient());
  assert.deepEqual(result, { success: true, preview: true, visitsAvailable: 2, visitsAfter: 1 });
  assert.equal(client.records.studioBookings.length, 0);
  assert.equal(client.records.classSessions.length, 0);
  assert.equal(client.records.membershipTransactions.length, 1);
});

test('API-key context records once without fabricating an operator', async () => {
  const client = new FakeClient();
  const first = await recordPastAttendance(input, { userWorkspaceId: null }, client.asClient());
  assert.equal(first.success, true);
  assert.equal(client.records.studioBookings[0].recordedBy, null);
  const second = await recordPastAttendance(input, { userWorkspaceId: null }, client.asClient());
  assert.ok(second.success && 'duplicate' in second && second.duplicate);
  assert.equal(client.records.studioBookings.length, 1);
  assert.equal(client.records.membershipTransactions.length, 2);
  assert.equal(client.records.studioMemberships[0].visitsAvailable, 1);
  assert.equal(client.records.studioEvents.length, 1);
  assert.equal(client.records.studioEvents[0].eventType, 'BOOKING_CREATED');
});

test('user context still records the authenticated operator', async () => {
  const client = new FakeClient();
  await recordPastAttendance(input, { userWorkspaceId: 'operator' }, client.asClient());
  assert.equal(client.records.studioBookings[0].recordedBy, 'operator');
});

test('API-key context does not bypass package ownership', async () => {
  const client = new FakeClient();
  const result = await recordPastAttendance({ ...input, personId: 'someone-else' }, { userWorkspaceId: null }, client.asClient());
  assert.ok(!result.success && result.code === 'MEMBERSHIP_NOT_OWNED');
  assert.equal(client.records.studioBookings.length, 0);
});

test('coordinated historical creation stops after session preparation without booking or consuming', async () => {
  const client = new FakeClient();
  let preparedId: string | null = null;
  const result = await recordPastAttendance(input, { userWorkspaceId: null }, client.asClient(), async (classSessionId) => {
    preparedId = classSessionId;
    assert.equal(client.records.classSessions.length, 1);
    assert.equal(client.records.studioBookings.length, 0);
    assert.equal(client.records.membershipTransactions.length, 1);
    return { success: false, status: 409, code: 'SESSION_OPERATION_BUSY', message: 'Busy' };
  });
  assert.ok(preparedId);
  assert.ok(!result.success && result.code === 'SESSION_OPERATION_BUSY');
  assert.equal(client.records.studioBookings.length, 0);
  assert.equal(client.records.membershipTransactions.length, 1);
  assert.equal(client.records.studioEvents.length, 0);
});

test('coordinated preview never creates a historical session or invokes ownership callback', async () => {
  const client = new FakeClient();
  const result = await recordPastAttendance({ ...input, previewOnly: true }, { userWorkspaceId: null }, client.asClient(), async () => {
    assert.fail('Preview must be readonly');
  });
  assert.ok(result.success && 'preview' in result);
  assert.equal(client.records.classSessions.length, 0);
});


test('historical attendance cannot use a shorter declared interval than the product', async () => {
  const client = new FakeClient();
  const result = await recordPastAttendance({ ...input, endsAt: '2021-01-01T10:10:00.000Z' }, { userWorkspaceId: null }, client.asClient());
  assert.ok(!result.success && result.code === 'ATTENDANCE_DURATION_MISMATCH');
  assert.equal(client.records.classSessions.length, 0);
  assert.equal(client.records.studioBookings.length, 0);
  assert.equal(client.records.membershipTransactions.length, 1);
});
