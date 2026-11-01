import assert from 'node:assert/strict';
import test from 'node:test';

import { recordPastAttendance } from '../record-past-attendance-handler.ts';

import {
  createClassSession,
  type CreateClassSessionInput,
} from '../create-class-session-handler.ts';

import { SessionParticipantsClient as FakeClient } from './fixtures/session-participants-client.ts';

const input: CreateClassSessionInput = {
  name: 'Группа',
  sessionFormat: 'GROUP_REFORMER',
  startsAt: '2099-01-01T10:00:00Z',
  durationMinutes: 55,
  capacity: 4,
  status: 'PLANNED',
  idempotencyKey: 'session',
  participants: [
    { personId: 'person-one', membershipId: 'membership-one' },
    { personId: 'person-two', membershipId: 'membership-two' },
  ],
};

test('group creation adds selected people, reserves once and journals each action', async () => {
  const client = new FakeClient();
  assert.ok((await createClassSession(input, client.asClient())).success);
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'RESERVE',
    ).length,
    2,
  );
  assert.equal(client.records.studioEvents.length, 3);
  assert.ok((await createClassSession(input, client.asClient())).success);
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(client.records.studioEvents.length, 3);
});
test('partial participant failure recovers unchanged batch without reserving again', async () => {
  const client = new FakeClient();
  client.failSecondBooking = true;
  await assert.rejects(
    createClassSession(input, client.asClient()),
    /Second booking failed/,
  );
  assert.equal(client.records.studioBookings.length, 1);
  const changed = await createClassSession(
    { ...input, participants: [input.participants![1]] },
    client.asClient(),
  );
  assert.ok(!changed.success && changed.code === 'IDEMPOTENCY_CONFLICT');
  assert.ok((await createClassSession(input, client.asClient())).success);
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'RESERVE',
    ).length,
    2,
  );
});
test('personal/group differentiation and eligibility are checked before creating the session', async () => {
  const client = new FakeClient();
  const personal = await createClassSession(
    { ...input, sessionFormat: 'PERSONAL_EQUIPMENT', capacity: 1 },
    client.asClient(),
  );
  assert.ok(!personal.success && personal.code === 'INVALID_PARTICIPANTS');
  const wrong = await createClassSession(
    {
      ...input,
      sessionFormat: 'PERSONAL_EQUIPMENT',
      capacity: 1,
      participants: [input.participants![0]],
    },
    client.asClient(),
  );
  assert.ok(!wrong.success && wrong.code === 'PARTICIPANT_PACKAGE_UNAVAILABLE');
  assert.equal(client.records.classSessions.length, 0);
  client.records.studioMemberships[0].category = 'PERSONAL';
  client.records.studioMemberships[0].format = 'PERSONAL_EQUIPMENT';
  assert.ok(
    (
      await createClassSession(
        {
          ...input,
          sessionFormat: 'PERSONAL_EQUIPMENT',
          capacity: 1,
          participants: [input.participants![0]],
        },
        client.asClient(),
      )
    ).success,
  );
  assert.equal(client.records.studioBookings[0].bookingType, 'PERSONAL');
});
test('standalone historical attendance requires its event and recovers audit failures without another consume', async () => {
  for (const mode of [
    'failBookingEvent',
    'loseBookingEventResponse',
  ] as const) {
    const client = new FakeClient();
    const attendance = {
      personId: 'person-one',
      membershipId: 'membership-one',
      startsAt: '2026-01-01T10:00:00Z',
      endsAt: '2026-01-01T10:55:00Z',
      reason: 'По журналу',
      source: 'ADMIN' as const,
      idempotencyKey: 'standalone',
    };
    assert.ok(
      (
        await recordPastAttendance(
          { ...attendance, previewOnly: true },
          { userWorkspaceId: null },
          client.asClient(),
        )
      ).success,
    );
    assert.equal(client.records.studioEvents.length, 0);
    client[mode] = true;
    await assert.rejects(
      recordPastAttendance(
        attendance,
        { userWorkspaceId: null },
        client.asClient(),
      ),
      /Audit/,
    );
    const repeated = await recordPastAttendance(
      attendance,
      { userWorkspaceId: null },
      client.asClient(),
    );
    assert.ok(
      repeated.success && 'duplicate' in repeated && repeated.duplicate,
    );
    assert.equal(client.records.studioBookings.length, 1);
    assert.equal(client.records.classSessions.length, 1);
    assert.equal(
      client.records.membershipTransactions.filter(
        (record) => record.transactionType === 'CONSUME',
      ).length,
      1,
    );
    assert.equal(client.records.studioEvents.length, 1);
    assert.equal(
      client.records.studioEvents[0].name,
      'Внесено прошедшее посещение',
    );
    assert.equal(client.records.studioMemberships[0].visitsAvailable, 7);
  }
});
test('historical selected people go through preview and consume, never future reservation', async () => {
  const client = new FakeClient();
  const historical = {
    ...input,
    startsAt: '2026-01-01T10:00:00Z',
    status: 'COMPLETED' as const,
    pastConfirmed: true,
    attendanceReason: 'По журналу посещений',
  };
  assert.ok((await createClassSession(historical, client.asClient())).success);
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'CONSUME',
    ).length,
    2,
  );
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'RESERVE',
    ).length,
    0,
  );
  assert.ok((await createClassSession(historical, client.asClient())).success);
  assert.equal(client.records.studioBookings.length, 2);
  assert.equal(
    client.records.membershipTransactions.filter(
      (record) => record.transactionType === 'CONSUME',
    ).length,
    2,
  );
  assert.equal(client.records.studioEvents.length, 3);
});
