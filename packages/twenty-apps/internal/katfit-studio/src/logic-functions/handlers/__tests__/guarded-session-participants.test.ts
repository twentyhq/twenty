import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createClassSession,
  type CreateClassSessionInput,
} from '../create-class-session-handler.ts';
import { createGuardedRegularBooking } from '../create-guarded-regular-booking-handler.ts';
import { SessionParticipantsClient } from './fixtures/session-participants-client.ts';

const command = (
  client: SessionParticipantsClient,
): CreateClassSessionInput => ({
  name: 'Группа',
  sessionFormat: 'GROUP_REFORMER',
  startsAt: '2099-01-01T10:00:00Z',
  durationMinutes: 55,
  capacity: 4,
  status: 'PLANNED',
  idempotencyKey: 'batch-one',
  participants: client.records.studioMemberships.map((membership) => ({
    personId: String(membership.personId),
    membershipId: String(membership.id),
  })),
});
const create = (
  input: CreateClassSessionInput,
  client: SessionParticipantsClient,
) =>
  createClassSession(input, client.asClient(), new Date(), {
    coordinateParticipants: true,
  });

test('creates the whole future batch under one journal and does not reserve again on replay', async () => {
  const client = new SessionParticipantsClient(true);
  const input = command(client);
  const first = await create(input, client);
  assert.equal(first.success, true);
  const replay = await create(input, client);
  assert.equal(replay.success, true);
  if (replay.success) assert.equal(replay.duplicate, true);
  assert.equal(client.records.studioSessionOperations.length, 1);
  assert.equal(client.records.studioSessionOperations[0].state, 'SUCCEEDED');
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(
    client.records.membershipTransactions.filter(
      (entry) => entry.transactionType === 'RESERVE',
    ).length,
    2,
  );
  assert.equal(client.records.classSessions[0].mutationLock, null);
  assert.equal(client.records.classSessions[0].bookedCount, 2);
});
test('historical batch consumes once and acquires an attendance owner for the completed session', async () => {
  const client = new SessionParticipantsClient(true);
  const input = {
    ...command(client),
    startsAt: '2026-01-10T10:00:00Z',
    status: 'COMPLETED' as const,
    pastConfirmed: true,
    attendanceReason: 'Подтверждение тренера',
  };
  assert.equal((await create(input, client)).success, true);
  assert.equal((await create(input, client)).success, true);
  assert.equal(
    client.records.membershipTransactions.filter(
      (entry) => entry.transactionType === 'CONSUME',
    ).length,
    2,
  );
  assert.equal(
    client.records.membershipTransactions.filter(
      (entry) => entry.transactionType === 'RESERVE',
    ).length,
    0,
  );
  const owner = JSON.parse(
    String(client.records.studioSessionOperations[0].ownerToken),
  );
  assert.equal(owner.kind, 'ATTEND');
  assert.equal(client.records.classSessions[0].mutationLock, null);
});
test('does not resume a partial participant batch or release its owner', async () => {
  const client = new SessionParticipantsClient(true);
  const input = command(client);
  client.failSecondBooking = true;
  assert.equal((await create(input, client)).success, false);
  assert.equal(client.records.studioBookings.length, 1);
  assert.equal(client.records.studioSessionOperations[0].state, 'NEEDS_REVIEW');
  assert.notEqual(client.records.classSessions[0].mutationLock, null);
  assert.equal((await create(input, client)).success, false);
  assert.equal(client.records.studioBookings.length, 1);
  assert.equal(
    client.records.membershipTransactions.filter(
      (entry) => entry.transactionType === 'RESERVE',
    ).length,
    1,
  );
});
test('a normal booking cannot enter a session held by an interrupted batch', async () => {
  const client = new SessionParticipantsClient(true);
  const input = command(client);
  client.failSecondBooking = true;
  await create(input, client);
  const second = input.participants![1];
  const result = await createGuardedRegularBooking(
    {
      ...second,
      classSessionId: String(client.records.classSessions[0].id),
      idempotencyKey: 'standalone',
    },
    client.asClient(),
  );
  assert.equal(result.success, false);
  if (!result.success) assert.equal(result.code, 'SESSION_OPERATION_BUSY');
  assert.equal(client.records.studioBookings.length, 1);
});
test('does not adopt legacy participants as a confirmed gateway batch', async () => {
  const client = new SessionParticipantsClient(true);
  const input = command(client);
  assert.equal(
    (await createClassSession(input, client.asClient())).success,
    true,
  );
  const result = await create(input, client);
  assert.equal(result.success, false);
  if (!result.success)
    assert.equal(
      result.code,
      'SESSION_OPERATION_LEGACY_DUPLICATE_REQUIRES_REVIEW',
    );
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(client.records.studioSessionOperations[0].state, 'NEEDS_REVIEW');
});
test('empty creation remains compatible with the calendar creation command and does not need a batch lock', async () => {
  const client = new SessionParticipantsClient(true);
  const input = { ...command(client), participants: [] };
  assert.equal((await create(input, client)).success, true);
  assert.equal(client.records.studioSessionOperations.length, 0);
  assert.equal(client.records.studioBookings.length, 0);
});
test('invalid participant UUIDs are rejected before creating the session', async () => {
  const client = new SessionParticipantsClient(true);
  const input = {
    ...command(client),
    participants: [
      {
        personId: 'invalid',
        membershipId: String(client.records.studioMemberships[0].id),
      },
    ],
  };
  assert.equal((await create(input, client)).success, false);
  assert.equal(client.records.classSessions.length, 0);
});
test('changed participants cannot reuse a completed batch command', async () => {
  const client = new SessionParticipantsClient(true);
  const input = command(client);
  await create(input, client);
  assert.equal(
    (
      await create(
        { ...input, participants: input.participants!.slice(0, 1) },
        client,
      )
    ).success,
    false,
  );
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(client.records.studioSessionOperations.length, 1);
});
