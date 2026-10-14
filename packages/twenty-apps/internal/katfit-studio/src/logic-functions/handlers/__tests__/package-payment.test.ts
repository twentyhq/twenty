import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import { confirmPackagePayment } from '../confirm-package-payment-handler.ts';

type RecordData = Record<string, unknown>;
type Selection = Record<
  string,
  {
    __args: {
      filter?: Record<string, { eq: unknown }>;
      data?: RecordData;
      id?: string;
    };
  }
>;
class FakeClient {
  records: Record<string, RecordData[]> = {
    studioProducts: [
      {
        id: 'product',
        name: 'Пакет',
        category: 'GROUP_PACKAGE',
        visitsIncluded: 8,
        price: { amountMicros: 10000000000, currencyCode: 'RUB' },
        validityDays: 30,
        isActive: true,
        validFrom: '2020-01-01',
        validTo: null,
      },
    ],
    people: [{ id: 'person' }],
    studioPayments: [],
    studioMemberships: [],
    membershipTransactions: [],
    studioEvents: [],
  };
  failEvent = false;
  loseEventResponse = false;
  nextId = 1;
  node(record: RecordData): RecordData {
    const node = { ...record };
    for (const relation of ['person', 'membership', 'product', 'payment'])
      if (record[relation + 'Id'])
        node[relation] = { id: record[relation + 'Id'] };
    return node;
  }
  async query(selection: Selection) {
    const [key, { __args: args }] = Object.entries(selection)[0];
    return {
      [key]: {
        edges: this.records[key]
          .filter((record) =>
            Object.entries(args.filter ?? {}).every(
              ([field, value]) => record[field] === value.eq,
            ),
          )
          .map((record) => ({ node: this.node(record) })),
      },
    };
  }
  async mutation(selection: Selection) {
    const [operation, { __args: args }] = Object.entries(selection)[0];
    if (operation === 'createStudioEvent' && this.failEvent) {
      this.failEvent = false;
      throw new Error('Event write failed');
    }
    const resources: Record<string, string> = {
      createStudioMembership: 'studioMemberships',
      createStudioPayment: 'studioPayments',
      createMembershipTransaction: 'membershipTransactions',
      createStudioEvent: 'studioEvents',
      updateStudioMembership: 'studioMemberships',
    };
    const records = this.records[resources[operation]];
    if (operation.startsWith('update')) {
      const record = records.find((item) => item.id === args.id);
      assert.ok(record);
      Object.assign(record, args.data);
      return { [operation]: this.node(record) };
    }
    const record: RecordData = { id: 'record-' + this.nextId++, ...args.data };
    if (
      records.some(
        (item) =>
          item.id === record.id ||
          (record.idempotencyKey &&
            item.idempotencyKey === record.idempotencyKey),
      )
    )
      throw new Error('duplicate entry');
    records.push(record);
    if (operation === 'createStudioEvent' && this.loseEventResponse) {
      this.loseEventResponse = false;
      throw new Error('Event response lost');
    }
    return { [operation]: this.node(record) };
  }
  asClient() {
    return this as unknown as CoreApiClient;
  }
}
const input = {
  personId: 'person',
  productId: 'product',
  paidAt: '2026-01-01T10:00:00Z',
  amount: 10000,
  paymentMethod: 'SBP' as const,
  idempotencyKey: 'purchase',
};
const context = { userWorkspaceId: null };

test('payment and package sale create one linked studio event on success and replay', async () => {
  const client = new FakeClient();
  const first = await confirmPackagePayment(input, context, client.asClient());
  assert.ok(first.success);
  const event = client.records.studioEvents[0];
  assert.equal(event.eventType, 'PAYMENT_CONFIRMED');
  assert.equal(event.membershipId, first.membershipId);
  assert.equal(event.id, first.paymentId);
  const details = JSON.parse(event.details as string) as RecordData;
  assert.equal(details.paymentId, first.paymentId);
  assert.equal(details.transactionId, first.transactionId);
  assert.equal(details.personId, input.personId);
  assert.equal(details.amount, input.amount);
  assert.ok(
    (await confirmPackagePayment(input, context, client.asClient())).success,
  );
  assert.equal(client.records.studioEvents.length, 1);
  assert.equal(client.records.studioPayments.length, 1);
  assert.equal(client.records.studioMemberships.length, 1);
  assert.equal(client.records.membershipTransactions.length, 1);
});
test('failed or lost audit writes are recovered without paying or granting twice', async () => {
  for (const mode of ['failed', 'lost']) {
    const client = new FakeClient();
    client.failEvent = mode === 'failed';
    client.loseEventResponse = mode === 'lost';
    await assert.rejects(
      confirmPackagePayment(input, context, client.asClient()),
      /Event/,
    );
    assert.equal(client.records.studioPayments.length, 1);
    assert.equal(client.records.membershipTransactions.length, 1);
    const repeated = await confirmPackagePayment(
      input,
      context,
      client.asClient(),
    );
    assert.ok(repeated.success && repeated.duplicate);
    assert.equal(client.records.studioEvents.length, 1);
    assert.equal(client.records.studioPayments.length, 1);
    assert.equal(client.records.studioMemberships.length, 1);
    assert.equal(client.records.membershipTransactions.length, 1);
    assert.equal(client.records.studioMemberships[0].visitsAvailable, 8);
  }
});
test('an existing event with wrong payment details cannot be silently accepted', async () => {
  const client = new FakeClient();
  await confirmPackagePayment(input, context, client.asClient());
  client.records.studioEvents[0].details = '{}';
  await assert.rejects(
    confirmPackagePayment(input, context, client.asClient()),
    /проверки журнала/,
  );
  assert.equal(client.records.studioPayments.length, 1);
  assert.equal(client.records.membershipTransactions.length, 1);
});
