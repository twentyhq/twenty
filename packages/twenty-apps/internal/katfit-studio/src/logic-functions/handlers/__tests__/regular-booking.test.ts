import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import { cancelRegularBooking } from '../cancel-regular-booking-handler.ts';
import { createRegularBooking } from '../create-regular-booking-handler.ts';

type RecordData = Record<string, unknown>;
type Filter = { or?: Filter[] } & Record<string, unknown>;
type Selection = Record<
  string,
  {
    __args: { filter?: Filter; first?: number; id?: string; data?: RecordData };
  }
>;

class FakeClient {
  records: Record<string, RecordData[]> = {
    studioMemberships: [
      {
        id: 'membership',
        activatedAt: '2020-01-01T00:00:00.000Z',
        expiresOn: null,
        personId: 'person',
        productId: 'product',
        status: 'ACTIVE',
        visitsGranted: 1,
        visitsAvailable: 1,
        visitsReserved: 0,
      },
    ],
    classSessions: [
      {
        id: 'session',
        startsAt: '2099-01-01T10:00:00.000Z',
        status: 'PLANNED',
        sessionFormat: 'GROUP_REFORMER',
        bookedCount: 0,
        capacity: 4,
      },
    ],
    studioBookings: [],
    membershipTransactions: [
      {
        id: 'grant',
        membershipId: 'membership',
        transactionType: 'GRANT',
        visitDelta: 1,
        occurredAt: '2020-01-01T00:00:00.000Z',
      },
    ],
    studioEvents: [],
  };
  failOn: string | undefined;
  nextId = 1;

  private matches(record: RecordData, filter: Filter = {}): boolean {
    if (filter.or) return filter.or.some((item) => this.matches(record, item));
    return Object.entries(filter).every(
      ([field, condition]) =>
        record[field] === (condition as { eq: unknown }).eq,
    );
  }

  private node(record: RecordData): RecordData {
    const result = { ...record };
    for (const relation of [
      'person',
      'membership',
      'classSession',
      'booking',
      'product',
    ]) {
      const id = record[`${relation}Id`];
      result[relation] = typeof id === 'string' ? { id } : null;
    }
    if (record.productId)
      result.product = {
        id: 'product',
        category: record.productCategory ?? 'GROUP_PACKAGE',
        sessionFormat: 'GROUP_REFORMER',
      };
    return result;
  }

  async query(selection: Selection): Promise<RecordData> {
    return Object.fromEntries(
      Object.entries(selection).map(([object, { __args: args }]) => [
        object,
        {
          edges: this.records[object]
            .filter((record) => this.matches(record, args.filter))
            .slice(0, args.first ?? 1000)
            .map((record) => ({ node: this.node(record) })),
        },
      ]),
    );
  }

  async mutation(selection: Selection): Promise<RecordData> {
    const [operation, { __args: args }] = Object.entries(selection)[0];
    if (this.failOn === operation) {
      this.failOn = undefined;
      throw new Error('Injected failure');
    }
    const objects: Record<string, string> = {
      createStudioBooking: 'studioBookings',
      createMembershipTransaction: 'membershipTransactions',
      createStudioEvent: 'studioEvents',
      updateStudioMembership: 'studioMemberships',
      updateStudioBooking: 'studioBookings',
      updateClassSession: 'classSessions',
    };
    const records = this.records[objects[operation]];
    if (operation.startsWith('create')) {
      const data: RecordData = {
        ...args.data,
        id: args.data?.id ?? `record-${this.nextId++}`,
      };
      if (records.some((record) => record.id === data.id))
        throw new Error('duplicate entry');
      if (
        operation === 'createMembershipTransaction' &&
        records.some(
          (record) =>
            record.idempotencyKey === data.idempotencyKey ||
            (data.bookingId &&
              record.bookingId === data.bookingId &&
              record.transactionType === data.transactionType),
        )
      ) {
        throw new Error('duplicate entry');
      }
      records.push(data);
      return { [operation]: this.node(data) };
    }
    const record = records.find((item) => item.id === args.id);
    assert.ok(record);
    Object.assign(record, args.data);
    return { [operation]: this.node(record) };
  }

  asClient(): CoreApiClient {
    return this as unknown as CoreApiClient;
  }
}

const input = {
  personId: 'person',
  membershipId: 'membership',
  classSessionId: 'session',
  idempotencyKey: 'booking-key',
};
const cancellation = (bookingId: string, idempotencyKey: string) => ({
  bookingId,
  idempotencyKey,
  cancelledAt: new Date().toISOString(),
});

test('rejects a booking replay for a different person, package or session', async () => {
  const client = new FakeClient();
  assert.equal(
    (await createRegularBooking(input, client.asClient())).success,
    true,
  );
  for (const changed of [
    { personId: 'other' },
    { membershipId: 'other' },
    { classSessionId: 'other' },
  ]) {
    const result = await createRegularBooking(
      { ...input, ...changed },
      client.asClient(),
    );
    assert.equal(result.success, false);
    if (!result.success) assert.equal(result.code, 'IDEMPOTENCY_CONFLICT');
  }
  assert.equal(client.records.studioBookings.length, 1);
});

test('recovers a booking interrupted before its reservation', async () => {
  const client = new FakeClient();
  client.failOn = 'createMembershipTransaction';
  await assert.rejects(
    createRegularBooking(input, client.asClient()),
    /Injected failure/,
  );
  assert.equal(client.records.studioBookings.length, 1);
  const result = await createRegularBooking(input, client.asClient());
  assert.equal(result.success, true);
  assert.equal(
    client.records.membershipTransactions.filter(
      (entry) => entry.transactionType === 'RESERVE',
    ).length,
    1,
  );
  assert.equal(client.records.studioMemberships[0].visitsAvailable, 0);
  assert.equal(client.records.studioMemberships[0].visitsReserved, 1);
  assert.equal(client.records.classSessions[0].bookedCount, 1);
});

test('repairs an interrupted slot count without reserving another visit', async () => {
  const client = new FakeClient();
  client.failOn = 'updateClassSession';
  await assert.rejects(
    createRegularBooking(input, client.asClient()),
    /Injected failure/,
  );
  assert.equal(
    (await createRegularBooking(input, client.asClient())).success,
    true,
  );
  assert.equal(client.records.membershipTransactions.length, 2);
  assert.equal(client.records.classSessions[0].bookedCount, 1);
});

test('cancels only once even when the retry uses a different key', async () => {
  const client = new FakeClient();
  const booked = await createRegularBooking(input, client.asClient());
  assert.ok(booked.success);
  const first = await cancelRegularBooking(
    cancellation(booked.bookingId, 'cancel-1'),
    client.asClient(),
  );
  const second = await cancelRegularBooking(
    cancellation(booked.bookingId, 'cancel-2'),
    client.asClient(),
  );
  assert.ok(first.success && second.success);
  assert.equal(second.duplicate, true);
  assert.equal(second.visitsAvailable, 1);
  assert.equal(client.records.studioMemberships[0].visitsReserved, 0);
  assert.equal(client.records.classSessions[0].bookedCount, 0);
  assert.equal(
    client.records.membershipTransactions.filter(
      (entry) => entry.transactionType === 'RELEASE',
    ).length,
    1,
  );
});

test('recovers a cancellation interrupted after releasing the reservation', async () => {
  const client = new FakeClient();
  const booked = await createRegularBooking(input, client.asClient());
  assert.ok(booked.success);
  client.failOn = 'updateStudioBooking';
  await assert.rejects(
    cancelRegularBooking(
      cancellation(booked.bookingId, 'cancel-1'),
      client.asClient(),
    ),
    /Injected failure/,
  );
  const release = client.records.membershipTransactions.find(
    (entry) => entry.transactionType === 'RELEASE',
  );
  const result = await cancelRegularBooking(
    cancellation(booked.bookingId, 'cancel-2'),
    client.asClient(),
  );
  assert.ok(result.success);
  assert.equal(result.visitsAvailable, 1);
  assert.equal(
    client.records.studioBookings[0].cancelledAt,
    release?.occurredAt,
  );
  assert.equal(client.records.membershipTransactions.length, 3);
  assert.equal(client.records.classSessions[0].bookedCount, 0);
});

test('rejects an invalid cancellation date without creating a release', async () => {
  const client = new FakeClient();
  const result = await cancelRegularBooking(
    { bookingId: 'booking', cancelledAt: 'invalid', idempotencyKey: 'key' },
    client.asClient(),
  );
  assert.equal(result.success, false);
  assert.equal(client.records.membershipTransactions.length, 1);
});

test('does not trust a stale positive cached balance', async () => {
  const client = new FakeClient();
  client.records.membershipTransactions.push({
    id: 'consumed',
    membershipId: 'membership',
    transactionType: 'CONSUME',
    visitDelta: -1,
    occurredAt: '2021-01-01T00:00:00.000Z',
  });
  const result = await createRegularBooking(input, client.asClient());
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.code, 'INSUFFICIENT_BALANCE');
  assert.equal(client.records.studioBookings.length, 0);
});

test('does not invent a release for a legacy already cancelled booking', async () => {
  const client = new FakeClient();
  const booked = await createRegularBooking(input, client.asClient());
  assert.ok(booked.success);
  client.records.studioBookings[0].status = 'CANCELLED_BY_STUDIO';
  const result = await cancelRegularBooking(
    cancellation(booked.bookingId, 'new-key'),
    client.asClient(),
  );
  assert.equal(result.success, false);
  if (!result.success)
    assert.equal(result.code, 'CANCELLATION_REQUIRES_REVIEW');
  assert.equal(client.records.membershipTransactions.length, 2);
});

test('requires booking audit and recovers it without a second reservation', async () => {
  const client = new FakeClient();
  client.failOn = 'createStudioEvent';
  await assert.rejects(
    createRegularBooking(input, client.asClient()),
    /Injected failure/,
  );
  assert.equal(client.records.studioBookings.length, 1);
  assert.equal(client.records.membershipTransactions.length, 2);
  assert.equal(client.records.studioEvents.length, 0);
  assert.ok((await createRegularBooking(input, client.asClient())).success);
  assert.ok((await createRegularBooking(input, client.asClient())).success);
  assert.equal(client.records.studioEvents.length, 1);
  assert.equal(client.records.studioEvents[0].eventType, 'BOOKING_CREATED');
  assert.equal(client.records.membershipTransactions.length, 2);
});

test('requires cancellation audit and preserves one release and one event on retries', async () => {
  const client = new FakeClient();
  const booked = await createRegularBooking(input, client.asClient());
  assert.ok(booked.success);
  client.failOn = 'createStudioEvent';
  await assert.rejects(
    cancelRegularBooking(
      cancellation(booked.bookingId, 'cancel'),
      client.asClient(),
    ),
    /Injected failure/,
  );
  assert.equal(client.records.studioBookings[0].status, 'CANCELLED_BY_STUDIO');
  assert.ok(
    (
      await cancelRegularBooking(
        cancellation(booked.bookingId, 'cancel'),
        client.asClient(),
      )
    ).success,
  );
  assert.ok(
    (
      await cancelRegularBooking(
        cancellation(booked.bookingId, 'another-key'),
        client.asClient(),
      )
    ).success,
  );
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'RELEASE',
    ).length,
    1,
  );
  const events = client.records.studioEvents.filter(
    (record) => record.eventType === 'BOOKING_CANCELLED',
  );
  assert.equal(events.length, 1);
  assert.equal(events[0].classSessionId, input.classSessionId);
});

test('cannot add a participant twice with different request keys', async () => {
  const client = new FakeClient();
  assert.ok((await createRegularBooking(input, client.asClient())).success);
  const repeated = await createRegularBooking(
    { ...input, idempotencyKey: 'another-key' },
    client.asClient(),
  );
  assert.ok(
    !repeated.success && repeated.code === 'PARTICIPANT_ALREADY_BOOKED',
  );
  assert.equal(client.records.studioBookings.length, 1);
});

test('rejects split packages, expired packages and split cancellations', async () => {
  const client = new FakeClient();
  client.records.studioMemberships[0].productCategory = 'SPLIT';
  const split = await createRegularBooking(input, client.asClient());
  assert.ok(!split.success && split.code === 'PRODUCT_NOT_SUPPORTED');
  client.records.studioMemberships[0].productCategory = 'GROUP_PACKAGE';
  client.records.studioMemberships[0].expiresOn = '2098-12-31';
  const expired = await createRegularBooking(input, client.asClient());
  assert.ok(
    !expired.success && expired.code === 'MEMBERSHIP_NOT_VALID_AT_SESSION',
  );
  client.records.studioMemberships[0].expiresOn = null;
  const booked = await createRegularBooking(input, client.asClient());
  assert.ok(booked.success);
  client.records.studioBookings[0].bookingType = 'SPLIT';
  const cancellationResult = await cancelRegularBooking(
    cancellation(booked.bookingId, 'cancel'),
    client.asClient(),
  );
  assert.ok(
    !cancellationResult.success &&
      cancellationResult.code === 'BOOKING_TYPE_NOT_SUPPORTED',
  );
  assert.equal(client.records.membershipTransactions.length, 2);
});
