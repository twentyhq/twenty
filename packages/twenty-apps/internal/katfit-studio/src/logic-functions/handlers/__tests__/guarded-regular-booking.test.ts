import assert from 'node:assert/strict';
import test from 'node:test';

import { type CoreApiClient } from 'twenty-client-sdk/core';

import { runBookingOperation } from '../../utils/run-booking-operation.ts';

import { createGuardedRegularBooking } from '../create-guarded-regular-booking-handler.ts';

import {
  FakeGatewayClient,
  input,
  bookingId,
} from './fixtures/booking-gateway-client.ts';

const execute = async (_input: typeof input, client: CoreApiClient) => {
  await client.mutation({
    createStudioBooking: { __args: { data: {} }, id: true },
  } as never);
  return { success: true as const, bookingId, duplicate: false };
};

test('journals and completes a booking before releasing ownership', async () => {
  const fake = new FakeGatewayClient();
  assert.deepEqual(
    await createGuardedRegularBooking(input, fake.client(), execute),
    { success: true, bookingId, duplicate: false },
  );
  assert.equal(fake.operations[0].state, 'SUCCEEDED');
  assert.equal(fake.token, null);
  assert.equal(fake.bookingWrites, 1);
  assert.deepEqual(JSON.parse(fake.operations[0].request), {
    command: input,
    membershipIds: [input.membershipId],
  });
});
test('replays a confirmed journal without another booking mutation', async () => {
  const fake = new FakeGatewayClient();
  await createGuardedRegularBooking(input, fake.client(), execute);
  assert.deepEqual(
    await createGuardedRegularBooking(input, fake.client(), execute),
    { success: true, bookingId, duplicate: true },
  );
  assert.equal(fake.bookingWrites, 1);
  assert.equal(fake.operations.length, 1);
});
test('rejects changed command data under an existing key', async () => {
  const fake = new FakeGatewayClient();
  await createGuardedRegularBooking(input, fake.client(), execute);
  const result = await createGuardedRegularBooking(
    { ...input, personId: bookingId },
    fake.client(),
    execute,
  );
  assert.equal(result.success, false);
  if (result.success) return;
  assert.equal(result.code, 'SESSION_OPERATION_REQUEST_CONFLICT');
  assert.equal(fake.bookingWrites, 1);
});
test('serializes concurrent gateway executions', async () => {
  const fake = new FakeGatewayClient();
  const results = await Promise.all([
    createGuardedRegularBooking(input, fake.client(), execute),
    createGuardedRegularBooking(
      { ...input, idempotencyKey: 'two' },
      fake.client(),
      execute,
    ),
  ]);
  assert.equal(results.filter((result) => result.success).length, 1);
  assert.equal(fake.bookingWrites, 1);
});
test('recovers a lost journal creation or completion reply by reading', async () => {
  const fake = new FakeGatewayClient();
  fake.loseCreateReply = true;
  fake.loseTransitionReply = 'SUCCEEDED';
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    true,
  );
  assert.equal(fake.operations.length, 1);
  assert.equal(fake.bookingWrites, 1);
  assert.equal(fake.token, null);
});
test('does not rerun business writes after an uncertain execution', async () => {
  const fake = new FakeGatewayClient();
  const uncertain = async (command: typeof input, client: CoreApiClient) => {
    await execute(command, client);
    throw Error('Response lost');
  };
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), uncertain))
      .success,
    false,
  );
  assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
  assert.notEqual(fake.token, null);
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    false,
  );
  assert.equal(fake.bookingWrites, 1);
});
test('recovers a confirmed business result when journal acknowledgement was unavailable', async () => {
  const fake = new FakeGatewayClient();
  fake.failReadsAfterTransition = 'SUCCEEDED';
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    false,
  );
  assert.notEqual(fake.token, null);
  fake.failJournalReads = false;
  fake.failReadsAfterTransition = null;
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    true,
  );
  assert.equal(fake.bookingWrites, 1);
  assert.equal(fake.token, null);
});
test('does not start business writes until the executing journal state is confirmed', async () => {
  const fake = new FakeGatewayClient();
  fake.failReadsAfterTransition = 'EXECUTING';
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    false,
  );
  assert.equal(fake.bookingWrites, 0);
  assert.notEqual(fake.token, null);
  fake.failJournalReads = false;
  fake.failReadsAfterTransition = null;
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    false,
  );
  assert.equal(fake.bookingWrites, 0);
});
test('a pure validation rejection is persisted and safely releases ownership', async () => {
  const fake = new FakeGatewayClient();
  let calls = 0;
  const reject = async () => {
    calls++;
    return {
      success: false as const,
      code: 'INSUFFICIENT_BALANCE',
      status: 409,
      message: 'Нет посещений',
    };
  };
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), reject)).success,
    false,
  );
  assert.equal(fake.operations[0].state, 'REJECTED');
  assert.equal(fake.token, null);
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), reject)).success,
    false,
  );
  assert.equal(calls, 1);
  assert.equal(fake.token, null);
});
test('a rejection after a mutation cannot automatically release the lock', async () => {
  const fake = new FakeGatewayClient();
  const reject = async (command: typeof input, client: CoreApiClient) => {
    await execute(command, client);
    return {
      success: false as const,
      code: 'PARTIAL',
      status: 409,
      message: 'Частичный результат',
    };
  };
  await createGuardedRegularBooking(input, fake.client(), reject);
  assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
  assert.notEqual(fake.token, null);
});
test('a retry releases a completed owner after a release outage without rerunning the booking', async () => {
  const fake = new FakeGatewayClient();
  fake.failRelease = true;
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    false,
  );
  assert.equal(fake.operations[0].state, 'SUCCEEDED');
  assert.notEqual(fake.token, null);
  fake.failRelease = false;
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    true,
  );
  assert.equal(fake.bookingWrites, 1);
  assert.equal(fake.token, null);
});
test('invalid input cannot create a journal or change a session', async () => {
  const fake = new FakeGatewayClient();
  await createGuardedRegularBooking(
    { ...input, personId: 'invalid' },
    fake.client(),
    execute,
  );
  assert.equal(fake.operations.length, 0);
  assert.equal(fake.token, null);
});

test('membership busy releases the unused claim and same key succeeds after purchase releases', async () => {
  const fake = new FakeGatewayClient();
  fake.membershipTokens.set(input.membershipId, 'purchase-owner');
  const execute = async (_input: typeof input, client: CoreApiClient) => {
    await client.mutation({
      createStudioBooking: { __args: { data: {} }, id: true },
    } as never);
    return { success: true as const, duplicate: false, bookingId };
  };
  const busy = await createGuardedRegularBooking(input, fake.client(), execute);
  assert.ok(!busy.success && busy.code === 'SESSION_OPERATION_MEMBERSHIP_BUSY');
  assert.equal(fake.operations[0].state, 'PREPARED');
  assert.equal(fake.operations[0].ownerToken, null);
  assert.equal(fake.token, null);
  assert.equal(fake.bookingWrites, 0);
  fake.membershipTokens.set(input.membershipId, null);
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    true,
  );
  assert.equal(
    (await createGuardedRegularBooking(input, fake.client(), execute)).success,
    true,
  );
  assert.equal(fake.bookingWrites, 1);
});

test('membership busy reset recovers lost reset reply by readback', async () => {
  const fake = new FakeGatewayClient();
  fake.membershipTokens.set(input.membershipId, 'purchase-owner');
  fake.loseTransitionReply = 'PREPARED';
  const result = await createGuardedRegularBooking(
    input,
    fake.client(),
    async () => {
      assert.fail('Busy membership must not start the business operation');
    },
  );
  assert.ok(
    !result.success && result.code === 'SESSION_OPERATION_MEMBERSHIP_BUSY',
  );
  assert.equal(fake.operations[0].state, 'PREPARED');
  assert.equal(fake.operations[0].ownerToken, null);
  assert.equal(fake.token, null);
});

test('membership busy never resets its claim if session release is unconfirmed', async () => {
  const fake = new FakeGatewayClient();
  fake.membershipTokens.set(input.membershipId, 'purchase-owner');
  fake.failRelease = true;
  const result = await createGuardedRegularBooking(
    input,
    fake.client(),
    async () => {
      assert.fail('Busy membership must not execute');
    },
  );
  assert.ok(
    !result.success && result.code === 'SESSION_OPERATION_RELEASE_UNCONFIRMED',
  );
  assert.equal(fake.operations[0].state, 'CLAIMED');
  assert.notEqual(fake.token, null);
  assert.equal(fake.operations[0].ownerToken, fake.token);
});

test('busy reset waits for every partially acquired membership release to be confirmed', async () => {
  class FailingMembershipRelease extends FakeGatewayClient {
    async mutation(selection: Parameters<FakeGatewayClient['mutation']>[0]) {
      if (selection.updateStudioMemberships?.__args.data?.mutationLock === null)
        throw Error('Membership release unavailable');
      return super.mutation(selection);
    }
  }
  const fake = new FailingMembershipRelease();
  fake.membershipTokens.set(input.membershipId, 'purchase-owner');
  const result = await runBookingOperation({
    command: input,
    prefix: 'regular-booking',
    client: fake.client(),
    membershipIds: [input.personId, input.membershipId],
    execute,
    decodeSuccess: () => null,
  });
  assert.ok(
    !result.success && result.code === 'SESSION_OPERATION_RELEASE_UNCONFIRMED',
  );
  assert.equal(fake.operations[0].state, 'CLAIMED');
  assert.equal(fake.membershipTokens.get(input.personId), fake.token);
  assert.notEqual(fake.token, null);
  assert.equal(fake.bookingWrites, 0);
});

test('a changed claim prevents reset and no business operation starts', async () => {
  class ChangedClaim extends FakeGatewayClient {
    async mutation(selection: Parameters<FakeGatewayClient['mutation']>[0]) {
      if (
        selection.updateStudioSessionOperations?.__args.data?.state ===
        'PREPARED'
      )
        this.operations[0].state = 'NEEDS_REVIEW';
      return super.mutation(selection);
    }
  }
  const fake = new ChangedClaim();
  fake.membershipTokens.set(input.membershipId, 'purchase-owner');
  const result = await createGuardedRegularBooking(
    input,
    fake.client(),
    execute,
  );
  assert.ok(
    !result.success && result.code === 'SESSION_OPERATION_JOURNAL_UNCONFIRMED',
  );
  assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
  assert.equal(fake.bookingWrites, 0);
});

test('completes and replays when Twenty returns empty journal text as strings', async () => {
  const fake = new FakeGatewayClient();
  fake.emptyTextAsString = true;
  assert.deepEqual(
    await createGuardedRegularBooking(input, fake.client(), execute),
    { success: true, bookingId, duplicate: false },
  );
  assert.equal(fake.token, null);
  assert.deepEqual(
    await createGuardedRegularBooking(input, fake.client(), execute),
    { success: true, bookingId, duplicate: true },
  );
  assert.equal(fake.bookingWrites, 1);
});
