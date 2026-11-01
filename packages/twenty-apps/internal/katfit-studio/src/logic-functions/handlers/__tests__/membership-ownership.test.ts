import assert from 'node:assert/strict';
import test from 'node:test';
import { runBookingOperation } from '../../utils/run-booking-operation.ts';
import {
  FakeGatewayClient,
  input,
  bookingId,
} from './fixtures/booking-gateway-client.ts';

const decodeSuccess = (value: unknown) => {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('success' in value) ||
    value.success !== true
  )
    return null;
  return { success: true as const, duplicate: false, bookingId };
};
test('serializes one package across separate session owners before business writes', async () => {
  const first = new FakeGatewayClient();
  const second = new FakeGatewayClient();
  second.membershipTokens = first.membershipTokens;
  let releaseBody!: () => void;
  let bodyEntered!: () => void;
  const entered = new Promise<void>((resolve) => {
    bodyEntered = resolve;
  });
  const body = new Promise<void>((resolve) => {
    releaseBody = resolve;
  });
  const pending = runBookingOperation({
    command: input,
    prefix: 'regular-booking',
    client: first.client(),
    membershipIds: [input.membershipId],
    decodeSuccess,
    execute: async () => {
      bodyEntered();
      await body;
      return { success: true as const, duplicate: false, bookingId };
    },
  });
  await entered;
  let writes = 0;
  const blocked = await runBookingOperation({
    command: { ...input, idempotencyKey: 'other-session' },
    prefix: 'regular-booking',
    client: second.client(),
    membershipIds: [input.membershipId],
    decodeSuccess,
    execute: async () => {
      writes++;
      return { success: true as const, duplicate: false, bookingId };
    },
  });
  assert.equal(blocked.success, false);
  assert.equal(writes, 0);
  assert.equal(second.token, null);
  assert.notEqual(first.membershipTokens.get(input.membershipId), null);
  releaseBody();
  assert.equal((await pending).success, true);
  assert.equal(first.membershipTokens.get(input.membershipId), null);
});
test('retains both ownership resources after an uncertain business write', async () => {
  const fake = new FakeGatewayClient();
  const result = await runBookingOperation({
    command: input,
    prefix: 'regular-booking',
    client: fake.client(),
    membershipIds: [input.membershipId],
    decodeSuccess,
    execute: async () => {
      throw Error('unknown write result');
    },
  });
  assert.equal(result.success, false);
  assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
  assert.ok(fake.token);
  assert.equal(fake.membershipTokens.get(input.membershipId), fake.token);
});

test('does not execute or unlock when package ownership cannot be confirmed', async () => {
  class UncertainMembershipClient extends FakeGatewayClient {
    override async query(selection: Parameters<FakeGatewayClient['query']>[0]) {
      if (selection.studioMemberships) throw Error('Package unavailable');
      return super.query(selection);
    }
    override async mutation(
      selection: Parameters<FakeGatewayClient['mutation']>[0],
    ) {
      if (selection.updateStudioMemberships) throw Error('Unknown delivery');
      return super.mutation(selection);
    }
  }
  const fake = new UncertainMembershipClient();
  let called = false;
  const result = await runBookingOperation({
    command: input,
    prefix: 'regular-booking',
    client: fake.client(),
    membershipIds: [input.membershipId],
    decodeSuccess,
    execute: async () => {
      called = true;
      return { success: true as const, duplicate: false, bookingId };
    },
  });
  assert.equal(result.success, false);
  assert.equal(called, false);
  assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
  assert.ok(fake.token);
});
