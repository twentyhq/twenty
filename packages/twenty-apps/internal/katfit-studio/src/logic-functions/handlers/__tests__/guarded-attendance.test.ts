import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { recordGuardedPastAttendance } from '../record-guarded-past-attendance-handler.ts';
import { type recordPastAttendance } from '../record-past-attendance-handler.ts';
import { recordGuardedSplitAttendance } from '../record-guarded-split-attendance-handler.ts';
import {
  FakeGatewayClient,
  input,
  bookingId,
} from './fixtures/booking-gateway-client.ts';

const secondId = 'f0b1786c-217c-4a6c-9c15-03b74de468a4';
const context = { userWorkspaceId: null };
const past = {
  personId: input.personId,
  membershipId: input.membershipId,
  startsAt: '2026-01-01T09:00:00.000Z',
  endsAt: '2026-01-01T10:00:00.000Z',
  reason: 'Журнал',
  source: 'ADMIN' as const,
  idempotencyKey: 'attendance',
};
const split = {
  classSessionId: input.classSessionId,
  membershipId: input.membershipId,
  pairId: input.personId,
  idempotencyKey: 'split-attendance',
};
const write = (client: CoreApiClient) =>
  client.mutation({
    createStudioBooking: { __args: { data: {} }, id: true },
  } as never);

test('historical attendance prepares a session before ownership and writes only under ownership, replaying the receipt', async () => {
  const fake = new FakeGatewayClient();
  fake.status = 'COMPLETED';
  let preparations = 0;
  let executions = 0;
  const execute: typeof recordPastAttendance = async (
    command,
    _context,
    client,
    coordinate,
  ) => {
    if (coordinate) {
      preparations++;
      return coordinate(input.classSessionId);
    }
    executions++;
    assert.equal(command.existingClassSessionId, input.classSessionId);
    assert.ok(fake.token);
    await write(client!);
    return {
      success: true,
      duplicate: false,
      bookingId,
      classSessionId: input.classSessionId,
      transactionId: secondId,
      visitsAvailable: 3,
    };
  };
  assert.equal(
    (await recordGuardedPastAttendance(past, context, fake.client(), execute))
      .success,
    true,
  );
  assert.deepEqual(
    await recordGuardedPastAttendance(past, context, fake.client(), execute),
    {
      success: true,
      duplicate: true,
      bookingId,
      classSessionId: input.classSessionId,
      transactionId: secondId,
      visitsAvailable: 3,
    },
  );
  assert.equal(executions, 1);
  assert.equal(preparations, 2);
  assert.equal(fake.bookingWrites, 1);
  assert.equal(fake.token, null);
});
test('historical preview never prepares a lock or journal', async () => {
  const fake = new FakeGatewayClient();
  const execute: typeof recordPastAttendance = async (
    command,
    _context,
    _client,
    coordinate,
  ) => {
    assert.equal(command.previewOnly, true);
    assert.equal(coordinate, undefined);
    return { success: true, preview: true, visitsAvailable: 3, visitsAfter: 2 };
  };
  assert.equal(
    (
      await recordGuardedPastAttendance(
        { ...past, previewOnly: true },
        context,
        fake.client(),
        execute,
      )
    ).success,
    true,
  );
  assert.equal(fake.operations.length, 0);
});
test('a partial historical debit preserves ownership and cannot be repeated', async () => {
  const fake = new FakeGatewayClient();
  fake.status = 'COMPLETED';
  const execute: typeof recordPastAttendance = async (
    _command,
    _context,
    client,
    coordinate,
  ) => {
    if (coordinate) return coordinate(input.classSessionId);
    await write(client!);
    throw Error('Consume reply lost');
  };
  assert.equal(
    (await recordGuardedPastAttendance(past, context, fake.client(), execute))
      .success,
    false,
  );
  assert.equal(
    (await recordGuardedPastAttendance(past, context, fake.client(), execute))
      .success,
    false,
  );
  assert.equal(fake.bookingWrites, 1);
  assert.notEqual(fake.token, null);
});
test('split attendance confirms one shared debit and replays both participant identifiers', async () => {
  const fake = new FakeGatewayClient();
  const execute = async (_command: typeof split, client: CoreApiClient) => {
    assert.ok(fake.token);
    await write(client);
    await write(client);
    return {
      success: true as const,
      duplicate: false,
      bookingIds: [bookingId, secondId],
      visitsAvailable: 2,
    };
  };
  assert.equal(
    (await recordGuardedSplitAttendance(split, fake.client(), execute)).success,
    true,
  );
  assert.deepEqual(
    await recordGuardedSplitAttendance(split, fake.client(), execute),
    {
      success: true,
      duplicate: true,
      bookingIds: [bookingId, secondId],
      visitsAvailable: 2,
    },
  );
  assert.equal(fake.bookingWrites, 2);
});
test('split attendance with an interrupted first participant does not debit again', async () => {
  const fake = new FakeGatewayClient();
  const execute = async (_command: typeof split, client: CoreApiClient) => {
    await write(client);
    throw Error('Lost update');
  };
  assert.equal(
    (await recordGuardedSplitAttendance(split, fake.client(), execute)).success,
    false,
  );
  assert.equal(
    (await recordGuardedSplitAttendance(split, fake.client(), execute)).success,
    false,
  );
  assert.equal(fake.bookingWrites, 1);
  assert.equal(fake.operations[0].state, 'NEEDS_REVIEW');
});
