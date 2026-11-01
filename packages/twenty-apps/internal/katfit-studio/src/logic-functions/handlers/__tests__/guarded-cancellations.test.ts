import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { confirmGuardedPayAsYouGoPayment } from '../confirm-guarded-pay-as-you-go-payment-handler.ts';
import { cancelClassSession } from '../cancel-class-session-handler.ts';
import { cancelGuardedBooking } from '../cancel-guarded-booking-handler.ts';
import { cancelPayAsYouGoBooking } from '../cancel-pay-as-you-go-booking-handler.ts';
import {
  FakeGatewayClient,
  input,
  bookingId,
} from './fixtures/booking-gateway-client.ts';

type Selection = Parameters<FakeGatewayClient['query']>[0];
class CancellationClient extends FakeGatewayClient {
  bookings: Array<Record<string, unknown>> = [];
  businessWrites = 0;
  bookedCount = 0;
  hasNextPage = false;
  failSessionReply = false;
  paymentStatus = 'EXPECTED';
  failBookingReply = false;
  override async query(selection: Selection) {
    if (selection.studioBookings)
      return {
        studioPayments: {
          edges: [{ node: { id: input.personId, status: this.paymentStatus } }],
        },
        classSessions: {
          pageInfo: { hasNextPage: false },
          edges: [
            {
              node: {
                id: input.classSessionId,
                status: this.status,
                startsAt: '2099-01-01T00:00:00.000Z',
                endsAt: '2099-01-01T01:00:00.000Z',
                name: 'Test',
                sessionFormat: 'GROUP_REFORMER',
                capacity: 1,
                recordingKey: 'key',
              },
            },
          ],
        },
        studioBookings: {
          edges: this.bookings.map((node) => ({ node: { ...node } })),
          pageInfo: { hasNextPage: this.hasNextPage },
        },
      } as Awaited<ReturnType<FakeGatewayClient['query']>>;
    return super.query(selection);
  }
  override async mutation(selection: Selection) {
    if (selection.updateClassSession) {
      this.bookedCount = Number(
        selection.updateClassSession.__args.data?.bookedCount,
      );
      return { updateClassSession: { id: input.classSessionId } } as Awaited<
        ReturnType<FakeGatewayClient['mutation']>
      >;
    }
    if (selection.updateStudioPayment || selection.updateStudioBooking) {
      if (selection.updateStudioPayment)
        this.paymentStatus = String(
          selection.updateStudioPayment.__args.data?.status,
        );
      if (selection.updateStudioBooking) {
        Object.assign(
          this.bookings[0],
          selection.updateStudioBooking.__args.data,
        );
        if (this.failBookingReply) throw Error('Lost booking response');
      }
      this.businessWrites++;
      return {
        updateStudioPayment: { id: input.personId },
        updateStudioBooking: { id: bookingId },
      } as Awaited<ReturnType<FakeGatewayClient['mutation']>>;
    }
    if (
      selection.updateClassSessions?.__args.data?.status ===
      'CANCELLED_BY_STUDIO'
    ) {
      this.businessWrites++;
      this.status = 'CANCELLED_BY_STUDIO';
      if (this.failSessionReply) throw Error('Lost response');
      return { updateClassSessions: [{ id: input.classSessionId }] } as Awaited<
        ReturnType<FakeGatewayClient['mutation']>
      >;
    }
    if (selection.createStudioEvent)
      return { createStudioEvent: { id: bookingId } } as Awaited<
        ReturnType<FakeGatewayClient['mutation']>
      >;
    return super.mutation(selection);
  }
}
const command = {
  classSessionId: input.classSessionId,
  cancelledAt: '2026-01-01T00:00:00.000Z',
  idempotencyKey: 'cancel-session',
};

test('empty future session cancellation records one durable result and replays without another update', async () => {
  const fake = new CancellationClient();
  const first = await cancelClassSession(command, fake.client());
  assert.equal(first.success, true);
  assert.deepEqual(await cancelClassSession(command, fake.client()), {
    success: true,
    duplicate: true,
    classSessionId: command.classSessionId,
    bookingIds: [],
  });
  assert.equal(fake.businessWrites, 1);
  assert.equal(fake.token, null);
});
test('partial inventory and changed expected booking inventory cannot cancel a session', async () => {
  const fake = new CancellationClient();
  fake.hasNextPage = true;
  assert.equal(
    (await cancelClassSession(command, fake.client())).success,
    false,
  );
  fake.hasNextPage = false;
  assert.equal(
    (
      await cancelClassSession(
        { ...command, expectedBookingIds: [bookingId] },
        fake.client(),
      )
    ).success,
    false,
  );
  assert.equal(fake.businessWrites, 0);
});
test('paid or attended bookings require review before any business mutation', async () => {
  for (const value of [
    { status: 'BOOKED', paymentStatus: 'PAID' },
    { status: 'ATTENDED', paymentStatus: 'EXPECTED' },
  ]) {
    const fake = new CancellationClient();
    fake.bookings = [
      {
        id: bookingId,
        classSessionId: input.classSessionId,
        membershipId: null,
        pairId: null,
        bookingType: 'PAY_AS_YOU_GO',
        ...value,
      },
    ];
    const result = await cancelClassSession(command, fake.client());
    assert.equal(result.success, false);
    assert.equal(fake.businessWrites, 0);
    assert.equal(fake.token, null);
  }
});
test('lost cancellation response holds ownership and never executes the uncertain operation again', async () => {
  const fake = new CancellationClient();
  fake.failSessionReply = true;
  assert.equal(
    (await cancelClassSession(command, fake.client())).success,
    false,
  );
  assert.ok(fake.token);
  assert.equal(
    (await cancelClassSession(command, fake.client())).success,
    false,
  );
  assert.equal(fake.businessWrites, 1);
});
test('invalid timestamp is rejected before accessing CRM', async () => {
  const client = {
    query: () => {
      throw Error('Must not query');
    },
  } as unknown as CoreApiClient;
  assert.equal(
    (
      await cancelGuardedBooking(
        { bookingId, cancelledAt: 'bad', idempotencyKey: 'cancel' },
        'regular',
        client,
      )
    ).success,
    false,
  );
});
test('duplicate expected payment records require review and never waive an arbitrary payment', async () => {
  let mutations = 0;
  const client = {
    query: async () => ({
      studioBookings: {
        edges: [
          {
            node: {
              id: bookingId,
              status: 'BOOKED',
              paymentStatus: 'EXPECTED',
              classSessionId: input.classSessionId,
            },
          },
        ],
      },
      studioPayments: {
        edges: [
          { node: { id: bookingId, status: 'EXPECTED' } },
          { node: { id: input.personId, status: 'EXPECTED' } },
        ],
      },
    }),
    mutation: async () => {
      mutations++;
      throw Error('Audit unavailable');
    },
  } as unknown as CoreApiClient;
  const result = await cancelPayAsYouGoBooking(
    { bookingId, cancelledAt: command.cancelledAt, idempotencyKey: 'cancel' },
    client,
  );
  assert.equal(result.success, false);
  // The best-effort failure audit is the only permitted mutation.
  assert.equal(mutations, 1);
});

test('whole-session cancellation waives an unpaid pay-as-you-go booking and preserves its payment record', async () => {
  const fake = new CancellationClient();
  fake.bookings = [
    {
      id: bookingId,
      classSessionId: input.classSessionId,
      membershipId: null,
      pairId: null,
      bookingType: 'REGULAR',
      consumesVisit: false,
      status: 'BOOKED',
      paymentStatus: 'EXPECTED',
    },
  ];
  const result = await cancelClassSession(
    { ...command, expectedBookingIds: [bookingId] },
    fake.client(),
  );
  assert.equal(result.success, true);
  assert.equal(fake.bookings[0].status, 'CANCELLED_BY_STUDIO');
  assert.equal(fake.bookings[0].paymentStatus, 'WAIVED');
  assert.equal(fake.paymentStatus, 'FAILED');
  assert.equal(fake.status, 'CANCELLED_BY_STUDIO');
  assert.equal(fake.bookings.length, 1);
});
test('partial booking cancellation holds ownership and leaves session open for review', async () => {
  const fake = new CancellationClient();
  fake.bookings = [
    {
      id: bookingId,
      classSessionId: input.classSessionId,
      membershipId: null,
      pairId: null,
      bookingType: 'REGULAR',
      consumesVisit: false,
      status: 'BOOKED',
      paymentStatus: 'EXPECTED',
    },
  ];
  fake.failBookingReply = true;
  assert.equal(
    (await cancelClassSession(command, fake.client())).success,
    false,
  );
  assert.ok(fake.token);
  assert.equal(fake.status, 'PLANNED');
  assert.equal(fake.paymentStatus, 'FAILED');
});

test('pay-as-you-go payment is serialized on the completed session and replays the same receipt', async () => {
  const fake = new CancellationClient();
  fake.status = 'COMPLETED';
  fake.bookings = [
    {
      id: bookingId,
      classSessionId: input.classSessionId,
      membershipId: null,
      status: 'ATTENDED',
      paymentStatus: 'EXPECTED',
    },
  ];
  const payment = {
    bookingId,
    paymentMethod: 'CASH' as const,
    paidAt: '2026-01-01T00:00:00.000Z',
  };
  assert.equal(
    (await confirmGuardedPayAsYouGoPayment(payment, fake.client())).success,
    true,
  );
  assert.equal(fake.paymentStatus, 'PAID');
  assert.deepEqual(
    await confirmGuardedPayAsYouGoPayment(payment, fake.client()),
    { success: true, duplicate: true },
  );
  assert.equal(fake.businessWrites, 1);
  assert.equal(fake.token, null);
});

test('stale expected session snapshot rejects cancellation under ownership without business writes', async () => {
  const fake = new CancellationClient();
  const result = await cancelClassSession(
    {
      ...command,
      expectedSession: {
        name: 'Test',
        startsAt: '2098-01-01T00:00:00.000Z',
        endsAt: '2098-01-01T01:00:00.000Z',
        sessionFormat: 'GROUP_REFORMER',
        capacity: 1,
        status: 'PLANNED',
        recordingKey: 'key',
      },
    },
    fake.client(),
  );
  assert.equal(result.success, false);
  assert.equal(fake.businessWrites, 0);
  assert.equal(fake.token, null);
});

test('individual pay-as-you-go cancellation frees the counted place and replay does not mutate again', async () => {
  const fake = new CancellationClient();
  fake.bookedCount = 1;
  fake.bookings = [
    {
      id: bookingId,
      classSessionId: input.classSessionId,
      membershipId: null,
      pairId: null,
      bookingType: 'REGULAR',
      consumesVisit: false,
      status: 'BOOKED',
      paymentStatus: 'EXPECTED',
    },
  ];
  const cancellation = {
    bookingId,
    cancelledAt: command.cancelledAt,
    idempotencyKey: 'single-cash-cancel',
  };
  assert.equal(
    (await cancelGuardedBooking(cancellation, 'pay-as-you-go', fake.client()))
      .success,
    true,
  );
  assert.equal(fake.bookedCount, 0);
  assert.equal(fake.paymentStatus, 'FAILED');
  assert.equal(fake.bookings[0].paymentStatus, 'WAIVED');
  const writes = fake.businessWrites;
  assert.equal(
    (await cancelGuardedBooking(cancellation, 'pay-as-you-go', fake.client()))
      .success,
    true,
  );
  assert.equal(fake.businessWrites, writes);
});
