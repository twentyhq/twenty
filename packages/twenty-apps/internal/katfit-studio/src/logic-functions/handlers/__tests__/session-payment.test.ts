import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';

import {
  createSessionPayment,
  type SessionPaymentInput,
} from '../create-session-payment-handler.ts';
import {
  createClassSession,
  type CreateClassSessionInput,
} from '../create-class-session-handler.ts';
import { SessionParticipantsClient } from './fixtures/session-participants-client.ts';

const setup = (
  status: 'PLANNED' | 'COMPLETED' = 'PLANNED',
  personal = false,
) => {
  const client = new SessionParticipantsClient(true);
  const personId = randomUUID(),
    productId = randomUUID();
  const input: SessionPaymentInput = {
    personId,
    productId,
    sessionFormat: personal ? 'PERSONAL_EQUIPMENT' : 'GROUP_REFORMER',
    startsAt:
      status === 'PLANNED'
        ? '2099-01-01T09:00:00+03:00'
        : '2026-01-01T00:30:00+03:00',
    durationMinutes: 55,
    status,
    paymentMethod: 'SBP',
    idempotencyKey: randomUUID(),
  };
  client.records.people.push({ id: personId });
  client.records.studioProducts.push({
    id: productId,
    name: 'Разовая тренировка',
    category: personal ? 'PERSONAL' : 'SINGLE',
    sessionFormat: input.sessionFormat,
    durationMinutes: 55,
    visitsIncluded: 1,
    isActive: true,
    validFrom: '2019-01-01',
    validTo: null,
    price: { amountMicros: 2000000000, currencyCode: 'RUB' },
  });
  return { client, input };
};

test('payment exists before the session, future debt has no paidAt and replay creates no second debt', async () => {
  const { client, input } = setup();
  const first = await createSessionPayment(input, client.asClient());
  assert.ok(first.success);
  assert.equal(client.records.classSessions.length, 0);
  assert.equal(client.records.studioPayments.length, 1);
  assert.equal(client.records.studioPayments[0].status, 'EXPECTED');
  assert.equal(client.records.studioPayments[0].paidAt, null);
  assert.equal(client.records.studioPayments[0].paymentMethod, null);
  assert.ok((await createSessionPayment(input, client.asClient())).success);
  assert.equal(client.records.studioPayments.length, 1);
  assert.equal(client.records.studioEvents.length, 1);
  assert.equal(
    (
      await createSessionPayment(
        { ...input, durationMinutes: 60 },
        client.asClient(),
      )
    ).success,
    false,
  );
});

test('historical personal payment uses midnight Moscow on the session day', async () => {
  const { client, input } = setup('COMPLETED', true);
  assert.ok((await createSessionPayment(input, client.asClient())).success);
  assert.equal(client.records.studioPayments[0].status, 'PAID');
  assert.equal(
    client.records.studioPayments[0].paidAt,
    '2025-12-31T21:00:00.000Z',
  );
  assert.equal(client.records.studioPayments[0].paymentMethod, 'SBP');
});

test('invalid client, product, duration, date, format and personal multipacks produce no payment', async () => {
  for (const change of [
    { personId: randomUUID() },
    { productId: randomUUID() },
    { durationMinutes: 60 },
    { sessionFormat: 'TRX' },
    { startsAt: '2020-01-01T09:00:00Z' },
  ]) {
    const { client, input } = setup();
    assert.equal(
      (await createSessionPayment({ ...input, ...change }, client.asClient()))
        .success,
      false,
    );
    assert.equal(client.records.studioPayments.length, 0);
  }
  const { client, input } = setup('COMPLETED', true);
  client.records.studioProducts[0].visitsIncluded = 4;
  assert.equal(
    (await createSessionPayment(input, client.asClient())).success,
    false,
  );
});

for (const status of ['PLANNED', 'COMPLETED'] as const) {
  test(`mixed group ${status}: package and single payment, exact replay, no visits charged to cash client`, async () => {
    const { client, input } = setup(status);
    const payment = await createSessionPayment(input, client.asClient());
    assert.ok(payment.success);
    const membership = client.records.studioMemberships[0];
    const session: CreateClassSessionInput = {
      name: 'Смешанная группа',
      ...input,
      capacity: 4,
      pastConfirmed: status === 'COMPLETED',
      attendanceReason: 'Журнал тренера',
      idempotencyKey: randomUUID(),
      participants: [
        {
          personId: String(membership.personId),
          membershipId: String(membership.id),
        },
        {
          personId: input.personId,
          productId: input.productId,
          paymentId: payment.paymentId,
        },
      ],
    };
    const create = () =>
      createClassSession(session, client.asClient(), new Date(), {
        coordinateParticipants: true,
      });
    assert.ok((await create()).success);
    assert.ok((await create()).success);
    assert.equal(client.records.studioBookings.length, 2);
    assert.equal(client.records.classSessions[0].bookedCount, 2);
    assert.equal(
      client.records.classSessions[0].attendedCount,
      status === 'COMPLETED' ? 2 : 0,
    );
    assert.equal(
      client.records.membershipTransactions.filter(
        (record) =>
          record.transactionType ===
          (status === 'COMPLETED' ? 'CONSUME' : 'RESERVE'),
      ).length,
      1,
    );
    const single = client.records.studioBookings.find(
      (record) => record.personId === input.personId,
    )!;
    assert.equal(single.consumesVisit, false);
    assert.equal(
      single.paymentStatus,
      status === 'COMPLETED' ? 'PAID' : 'EXPECTED',
    );
    assert.equal(
      client.records.studioPayments[0].externalId,
      `pay-as-you-go:${single.id}`,
    );
    const second = await createClassSession(
      { ...session, idempotencyKey: randomUUID() },
      client.asClient(),
    );
    assert.equal(second.success, false);
    assert.equal(client.records.classSessions.length, 1);
  });
}

test('date changes reject the payment before creating a session', async () => {
  const { client, input } = setup();
  const payment = await createSessionPayment(input, client.asClient());
  assert.ok(payment.success);
  const result = await createClassSession(
    {
      ...input,
      startsAt: '2099-01-02T09:00:00+03:00',
      capacity: 4,
      participants: [
        {
          personId: input.personId,
          productId: input.productId,
          paymentId: payment.paymentId,
        },
      ],
    },
    client.asClient(),
  );
  assert.equal(result.success, false);
  assert.equal(client.records.classSessions.length, 0);
});

test('lost payment audit recovers with the same payment, without a second receipt', async () => {
  const { client, input } = setup('COMPLETED');
  client.failPaymentEvent = true;
  await assert.rejects(
    createSessionPayment(input, client.asClient()),
    /Payment audit failed/,
  );
  assert.equal(client.records.studioPayments.length, 1);
  assert.equal(client.records.studioEvents.length, 0);
  assert.ok((await createSessionPayment(input, client.asClient())).success);
  assert.equal(client.records.studioPayments.length, 1);
  assert.equal(client.records.studioEvents.length, 1);
});

for (const status of ['PLANNED', 'COMPLETED'] as const) {
  test(`personal ${status} records one participant without a package`, async () => {
    const { client, input } = setup(status, true);
    const payment = await createSessionPayment(input, client.asClient());
    assert.ok(payment.success);
    const session: CreateClassSessionInput = {
      ...input,
      capacity: 1,
      pastConfirmed: status === 'COMPLETED',
      attendanceReason: 'Журнал тренера',
      idempotencyKey: randomUUID(),
      participants: [
        {
          personId: input.personId,
          productId: input.productId,
          paymentId: payment.paymentId,
        },
      ],
    };
    const result = await createClassSession(
      session,
      client.asClient(),
      new Date(),
      { coordinateParticipants: true },
    );
    assert.ok(result.success);
    assert.equal(client.records.studioBookings.length, 1);
    assert.equal(client.records.studioBookings[0].bookingType, 'PERSONAL');
    assert.equal(client.records.membershipTransactions.length, 2);
  });
}

test('partial payment linking retains the session owner and does not create another booking on retry', async () => {
  const { client, input } = setup();
  const payment = await createSessionPayment(input, client.asClient());
  assert.ok(payment.success);
  const session: CreateClassSessionInput = {
    ...input,
    capacity: 4,
    idempotencyKey: randomUUID(),
    participants: [
      {
        personId: input.personId,
        productId: input.productId,
        paymentId: payment.paymentId,
      },
    ],
  };
  client.failPaymentLink = true;
  const create = () =>
    createClassSession(session, client.asClient(), new Date(), {
      coordinateParticipants: true,
    });
  assert.equal((await create()).success, false);
  assert.equal(client.records.studioSessionOperations[0].state, 'NEEDS_REVIEW');
  assert.equal((await create()).success, false);
  assert.equal(client.records.studioBookings.length, 1);
  assert.equal(client.records.studioPayments.length, 1);
});
