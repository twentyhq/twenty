import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import { createGuardedSplitBooking } from '../create-guarded-split-booking-handler.ts';
import { createGuardedPayAsYouGoBooking } from '../create-guarded-pay-as-you-go-booking-handler.ts';
import { createGuardedRegularBooking } from '../create-guarded-regular-booking-handler.ts';
import {
  FakeGatewayClient,
  input,
  bookingId,
} from './fixtures/booking-gateway-client.ts';

const secondId = 'f0b1786c-217c-4a6c-9c15-03b74de468a4';
const pairInput = {
  classSessionId: input.classSessionId,
  membershipId: input.membershipId,
  pairId: input.personId,
  idempotencyKey: 'pair',
};
const payInput = {
  classSessionId: input.classSessionId,
  personId: input.personId,
  productId: input.membershipId,
  idempotencyKey: 'pay',
};
const mutate = (client: CoreApiClient) =>
  client.mutation({
    createStudioBooking: { __args: { data: {} }, id: true },
  } as never);
const split = async (_command: typeof pairInput, client: CoreApiClient) => {
  await mutate(client);
  await mutate(client);
  return {
    success: true as const,
    duplicate: false,
    bookingIds: [bookingId, secondId],
  };
};
const pay = async (_command: typeof payInput, client: CoreApiClient) => {
  await mutate(client);
  return {
    success: true as const,
    duplicate: false,
    bookingId,
    paymentId: secondId,
  };
};

test('split replay returns the same two bookings without rerunning the shared-reserve operation', async () => {
  const fake = new FakeGatewayClient();
  let executions = 0;
  const execute = async (command: typeof pairInput, client: CoreApiClient) => {
    executions++;
    return split(command, client);
  };
  assert.equal(
    (await createGuardedSplitBooking(pairInput, fake.client(), execute))
      .success,
    true,
  );
  const replay = await createGuardedSplitBooking(
    pairInput,
    fake.client(),
    execute,
  );
  assert.deepEqual(replay, {
    success: true,
    duplicate: true,
    bookingIds: [bookingId, secondId],
  });
  assert.equal(executions, 1);
  assert.equal(fake.bookingWrites, 2);
  assert.equal(fake.token, null);
});
test('pay-as-you-go replay preserves the expected payment identity without rerunning the operation', async () => {
  const fake = new FakeGatewayClient();
  let executions = 0;
  const execute = async (command: typeof payInput, client: CoreApiClient) => {
    executions++;
    return pay(command, client);
  };
  await createGuardedPayAsYouGoBooking(payInput, fake.client(), execute);
  assert.deepEqual(
    await createGuardedPayAsYouGoBooking(payInput, fake.client(), execute),
    { success: true, duplicate: true, bookingId, paymentId: secondId },
  );
  assert.equal(executions, 1);
  assert.equal(fake.bookingWrites, 1);
});
test('ordinary, pair and pay-as-you-go routes contend for the same session owner', async () => {
  const fake = new FakeGatewayClient();
  const results = await Promise.all([
    createGuardedRegularBooking(input, fake.client(), async () => ({
      success: true,
      duplicate: false,
      bookingId,
    })),
    createGuardedSplitBooking(pairInput, fake.client(), split),
    createGuardedPayAsYouGoBooking(payInput, fake.client(), pay),
  ]);
  assert.equal(results.filter((result) => result.success).length, 1);
});
test('an interrupted split operation cannot rerun after only one participant was written', async () => {
  const fake = new FakeGatewayClient();
  let executions = 0;
  const partial = async (_command: typeof pairInput, client: CoreApiClient) => {
    executions++;
    await mutate(client);
    throw Error('Lost first booking response');
  };
  assert.equal(
    (await createGuardedSplitBooking(pairInput, fake.client(), partial))
      .success,
    false,
  );
  assert.equal(
    (await createGuardedSplitBooking(pairInput, fake.client(), split)).success,
    false,
  );
  assert.equal(fake.bookingWrites, 1);
  assert.equal(executions, 1);
  assert.notEqual(fake.token, null);
  assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
});
test('an interrupted pay-as-you-go operation keeps ownership until the payment is reconciled', async () => {
  const fake = new FakeGatewayClient();
  const partial = async (_command: typeof payInput, client: CoreApiClient) => {
    await mutate(client);
    throw Error('Expected payment unconfirmed');
  };
  await createGuardedPayAsYouGoBooking(payInput, fake.client(), partial);
  assert.equal(
    (await createGuardedPayAsYouGoBooking(payInput, fake.client(), pay))
      .success,
    false,
  );
  assert.equal(fake.bookingWrites, 1);
  assert.notEqual(fake.token, null);
});
test('rejects incomplete or duplicate pair identities in a successful receipt', async () => {
  for (const bookingIds of [
    [bookingId],
    [bookingId, bookingId],
    [bookingId, 'invalid'],
  ]) {
    const fake = new FakeGatewayClient();
    const result = await createGuardedSplitBooking(
      pairInput,
      fake.client(),
      async () => ({ success: true, duplicate: false, bookingIds }),
    );
    assert.equal(result.success, false);
    assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
    assert.notEqual(fake.token, null);
  }
});
test('requires a valid payment ID in a successful pay-as-you-go receipt', async () => {
  const fake = new FakeGatewayClient();
  assert.equal(
    (
      await createGuardedPayAsYouGoBooking(
        payInput,
        fake.client(),
        async () => ({
          success: true,
          duplicate: false,
          bookingId,
          paymentId: 'invalid',
        }),
      )
    ).success,
    false,
  );
  assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
});
test('changed pair or product data cannot reuse a prior operation key', async () => {
  const splitClient = new FakeGatewayClient();
  await createGuardedSplitBooking(pairInput, splitClient.client(), split);
  const changedPair = await createGuardedSplitBooking(
    { ...pairInput, pairId: secondId },
    splitClient.client(),
    split,
  );
  assert.equal(changedPair.success, false);
  const payClient = new FakeGatewayClient();
  await createGuardedPayAsYouGoBooking(payInput, payClient.client(), pay);
  assert.equal(
    (
      await createGuardedPayAsYouGoBooking(
        { ...payInput, productId: secondId },
        payClient.client(),
        pay,
      )
    ).success,
    false,
  );
});
test('legacy pair or payment duplicates need review rather than implying a completed reserve or payment', async () => {
  const fakePair = new FakeGatewayClient();
  const pairResult = await createGuardedSplitBooking(
    pairInput,
    fakePair.client(),
    async () => ({
      success: true,
      duplicate: true,
      bookingIds: [bookingId, secondId],
    }),
  );
  assert.equal(pairResult.success, false);
  if (!pairResult.success)
    assert.equal(
      pairResult.code,
      'SESSION_OPERATION_LEGACY_DUPLICATE_REQUIRES_REVIEW',
    );
  const fakePay = new FakeGatewayClient();
  assert.equal(
    (
      await createGuardedPayAsYouGoBooking(
        payInput,
        fakePay.client(),
        async () => ({
          success: true,
          duplicate: true,
          bookingId,
          paymentId: secondId,
        }),
      )
    ).success,
    false,
  );
  assert.equal(fakePair.operations[0].state, 'NEEDS_REVIEW');
  assert.equal(fakePay.operations[0].state, 'NEEDS_REVIEW');
});
test('malformed pair or product identifiers cannot create an operation', async () => {
  const fake = new FakeGatewayClient();
  assert.equal(
    (
      await createGuardedSplitBooking(
        { ...pairInput, pairId: 'invalid' },
        fake.client(),
        split,
      )
    ).success,
    false,
  );
  assert.equal(
    (
      await createGuardedPayAsYouGoBooking(
        { ...payInput, productId: 'invalid' },
        fake.client(),
        pay,
      )
    ).success,
    false,
  );
  assert.equal(fake.operations.length, 0);
});
