import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { recordExpectedPaymentEvent } from '../expected-payment-event.ts';

class PaymentEventClient {
  rows: Record<string, unknown>[] = [];
  writes = 0;
  loseReply = false;
  failWrite = false;
  invalidRead = false;
  async query() {
    return this.invalidRead
      ? {}
      : {
          studioEvents: {
            edges: this.rows.map((node) => ({ node })),
            pageInfo: { hasNextPage: false },
          },
        };
  }
  async mutation(
    selection: Record<string, { __args: { data: Record<string, unknown> } }>,
  ) {
    this.writes++;
    if (this.failWrite) throw Error('failed');
    const data = selection.createStudioEvent.__args.data;
    this.rows.push(data);
    if (this.loseReply) throw Error('lost reply');
    return { createStudioEvent: { id: data.id } };
  }
  asClient() {
    return this as unknown as CoreApiClient;
  }
}
const input = {
  paymentId: 'payment',
  bookingId: 'booking',
  classSessionId: 'session',
  personId: 'person',
  idempotencyKey: 'one',
};

test('expected-payment audit is mandatory, uniquely identified and idempotent', async () => {
  const client = new PaymentEventClient();
  await recordExpectedPaymentEvent(input, client.asClient());
  await recordExpectedPaymentEvent(input, client.asClient());
  assert.equal(client.writes, 1);
  assert.equal(client.rows[0].id, input.paymentId);
  assert.equal(client.rows[0].eventType, 'PAYMENT_EXPECTED');
  assert.equal(client.rows[0].bookingId, input.bookingId);
});
test('a changed booking cannot reuse the payment audit', async () => {
  const client = new PaymentEventClient();
  await recordExpectedPaymentEvent(input, client.asClient());
  await assert.rejects(
    () =>
      recordExpectedPaymentEvent(
        { ...input, bookingId: 'other' },
        client.asClient(),
      ),
    /conflict/,
  );
  assert.equal(client.writes, 1);
});
test('a lost reply is confirmed without a second event', async () => {
  const client = new PaymentEventClient();
  client.loseReply = true;
  await recordExpectedPaymentEvent(input, client.asClient());
  assert.equal(client.writes, 1);
});
test('an unknown read cannot be treated as absence of an event', async () => {
  const client = new PaymentEventClient();
  client.invalidRead = true;
  await assert.rejects(() =>
    recordExpectedPaymentEvent(input, client.asClient()),
  );
  assert.equal(client.writes, 0);
});
test('a missing audit write is not silently accepted', async () => {
  const client = new PaymentEventClient();
  client.failWrite = true;
  await assert.rejects(
    () => recordExpectedPaymentEvent(input, client.asClient()),
    /write unconfirmed/,
  );
  assert.equal(client.writes, 1);
});
