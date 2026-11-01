import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { runMembershipPurchase } from '../run-membership-purchase.ts';

type Selection = Record<
  string,
  {
    __args: {
      filter?: { and: Array<Record<string, { eq?: unknown; is?: string }>> };
      data?: Record<string, unknown>;
    };
  }
>;
const membershipId = '9cb2a01c-b208-41e1-b7c5-3408fe4f9322';
const receipt = {
  success: true as const,
  duplicate: false,
  membershipId,
  visitsAvailable: 4,
  paymentId: 'payment',
};
class FakePurchase {
  token: string | null = null;
  saved: string | null = null;
  balance = 4;
  emptyNullableText = false;
  loseReceipt = false;
  writes = 0;
  async query(selection: Selection) {
    const result: Record<string, unknown> = {
      studioMemberships: {
        edges: [
          {
            node: {
              id: membershipId,
              mutationLock: this.token ?? (this.emptyNullableText ? '' : null),
              purchaseOperationReceipt:
                this.saved ?? (this.emptyNullableText ? '' : null),
              visitsGranted: 4,
              visitsReserved: 0,
              visitsConsumed: 0,
              visitsAvailable: this.balance,
            },
          },
        ],
        pageInfo: { hasNextPage: false },
      },
    };
    if (selection.membershipTransactions)
      result.membershipTransactions = {
        edges: [
          {
            node: {
              id: 'grant',
              transactionType: 'GRANT',
              visitDelta: 4,
              occurredAt: '2026-01-01T00:00:00.000Z',
            },
          },
        ],
        pageInfo: { hasNextPage: false },
      };
    return result;
  }
  async mutation(selection: Selection) {
    const args = selection.updateStudioMemberships.__args;
    const matches = args.filter!.and.every((condition) =>
      Object.entries(condition).every(([field, value]) => {
        const current =
          field === 'id'
            ? membershipId
            : field === 'mutationLock'
              ? this.token
              : this.saved;
        return value.is === 'NULL' ? current === null : current === value.eq;
      }),
    );
    if (!matches) return { updateStudioMemberships: [] };
    if ('mutationLock' in args.data!)
      this.token = args.data!.mutationLock as string | null;
    if ('purchaseOperationReceipt' in args.data!) {
      this.saved = args.data!.purchaseOperationReceipt as string;
      if (this.loseReceipt) throw Error('Lost receipt reply');
    }
    return {
      updateStudioMemberships: [{ id: membershipId, mutationLock: this.token }],
    };
  }
  client() {
    return this as unknown as CoreApiClient;
  }
}
const run = (
  fake: FakePurchase,
  execute = async () => {
    fake.writes++;
    return receipt;
  },
  request = 'frozen purchase',
) =>
  runMembershipPurchase({
    membershipId,
    request,
    client: fake.client(),
    execute,
    decodeSuccess: (value) =>
      typeof value === 'object' &&
      value !== null &&
      'paymentId' in value &&
      value.paymentId === 'payment'
        ? (value as typeof receipt)
        : null,
  });
test('purchase confirms ledger and replays saved receipt without resetting later balances', async () => {
  const fake = new FakePurchase();
  assert.equal((await run(fake)).success, true);
  fake.balance = 2;
  assert.deepEqual(await run(fake), { ...receipt, duplicate: true });
  assert.equal(fake.writes, 1);
  assert.equal(fake.token, null);
});
test('purchase blocks changed command on same membership', async () => {
  const fake = new FakePurchase();
  await run(fake);
  const result = await run(fake, undefined, 'different');
  assert.ok(
    !result.success && result.code === 'MEMBERSHIP_PURCHASE_REQUEST_CONFLICT',
  );
  assert.equal(fake.writes, 1);
});
test('partial grant never replays financial writes and retains ownership', async () => {
  const fake = new FakePurchase();
  assert.equal(
    (
      await run(fake, async () => {
        fake.writes++;
        throw Error('Grant reply lost');
      })
    ).success,
    false,
  );
  assert.equal((await run(fake)).success, false);
  assert.equal(fake.writes, 1);
  assert.notEqual(fake.token, null);
  assert.match(fake.saved!, /NEEDS_REVIEW/);
});
test('unconfirmed balance cannot produce a terminal successful receipt', async () => {
  const fake = new FakePurchase();
  fake.balance = 1;
  assert.equal((await run(fake)).success, false);
  assert.match(fake.saved!, /NEEDS_REVIEW/);
  assert.notEqual(fake.token, null);
});
test('lost journal reply recovers by read without duplicate grant', async () => {
  const fake = new FakePurchase();
  fake.loseReceipt = true;
  assert.equal((await run(fake)).success, true);
  assert.equal(fake.writes, 1);
  assert.equal(fake.token, null);
});
test('existing session owner of membership prevents purchase recalculation', async () => {
  const fake = new FakePurchase();
  fake.token = 'session owner';
  assert.equal((await run(fake)).success, false);
  assert.equal(fake.writes, 0);
  assert.equal(fake.saved, null);
});

test('legacy duplicate without a saved receipt stays under review despite matching balance', async () => {
  const fake = new FakePurchase();
  const result = await run(fake, async () => ({ ...receipt, duplicate: true }));
  assert.equal(result.success, false);
  assert.notEqual(fake.token, null);
  assert.match(fake.saved!, /NEEDS_REVIEW/);
});

test('empty nullable text from Twenty permits the first purchase and exact replay', async () => {
  const fake = new FakePurchase();
  fake.emptyNullableText = true;
  assert.equal((await run(fake)).success, true);
  assert.equal((await run(fake)).success, true);
  assert.equal(fake.writes, 1);
  assert.equal(fake.token, null);
});
