import { summarizeTrainerCompensation } from '../../utils/trainer-compensation-summary.ts';
import { assignSessionTrainer } from '../assign-session-trainer-handler.ts';
import assert from 'node:assert/strict';
import test from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import {
  closeTrainerCompensation,
  publishTrainerPayRate,
} from '../trainer-compensation-handler.ts';
import { acquireSessionMutationLock } from '../../utils/session-mutation-lock.ts';
import {
  type CompensationRate,
  type CompensationSnapshot,
} from '../../utils/trainer-compensation.ts';

type RecordData = Record<string, unknown>;
type Selection = Record<
  string,
  RecordData & {
    __args: { filter?: RecordData; data?: RecordData; id?: string };
  }
>;
const rate: CompensationRate = {
  id: 'rate',
  name: 'Группа',
  version: 1,
  sessionFormat: 'GROUP_REFORMER',
  amountFor1: { amountMicros: 700_000_000, currencyCode: 'RUB' },
  amountFor2: { amountMicros: 1_100_000_000, currencyCode: 'RUB' },
  amountFor3: { amountMicros: 1_300_000_000, currencyCode: 'RUB' },
  amountFor4: { amountMicros: 1_650_000_000, currencyCode: 'RUB' },
};
class FakeClient {
  records: Record<string, RecordData[]> = {
    studioEvents: [],
    studioTrainers: [{ id: 'trainer', name: 'Тренер', active: true }],
    trainerPayRates: [
      {
        ...rate,
        publishedAt: '2020-01-01T00:00:00.000Z',
        publishedBy: 'admin',
        publishedSnapshot: JSON.stringify(rate),
      },
    ],
    trainerRateAssignments: [
      {
        id: 'assignment',
        name: 'Основной',
        trainerId: 'trainer',
        payRateId: 'rate',
        validFrom: '2020-01-01T00:00:00.000Z',
        validUntil: null,
      },
    ],
    classSessions: [
      {
        id: '00000000-0000-4000-8000-000000000001',
        name: 'Группа 10:00',
        startsAt: '2021-01-01T10:00:00.000Z',
        endsAt: '2021-01-01T10:55:00.000Z',
        status: 'COMPLETED',
        sessionFormat: 'GROUP_REFORMER',
        capacity: 4,
        completionLockedAt: null, mutationLock: null,
        trainerId: 'trainer',
      },
    ],
    studioBookings: [],
    trainerPayEntries: [],
    studioSessionLocks: [],
    membershipTransactions: [],
  };
  failOn: string | null = null;
  loseResponseOn: string | null = null;
  attempts: string[] = [];
  sequence = 0;
  constructor(participants = 4) {
    this.records.studioBookings = Array.from(
      { length: participants },
      (_, index) => ({
        id: `booking-${index}`,
        name: `Запись ${index}`,
        classSessionId: '00000000-0000-4000-8000-000000000001',
        personId: `person-${index}`,
        person: {
          id: `person-${index}`,
          name: { firstName: `Клиент ${index}`, lastName: 'Тест' },
        },
        status: 'ATTENDED',
        bookingType: 'REGULAR',
        paymentStatus: 'PAID',
        consumesVisit: true,
        bookedAt: '2020-12-20T10:00:00.000Z',
        externalId: `booking-key-${index}`,
        recordedAt: '2021-01-01T11:00:00.000Z',
        recordedBy: 'operator',
        recordingReason: 'По журналу',
        recordingSource: 'TRAINER',
        recordingSourceDetails: null,
        cancelledAt: null,
        membership: { id: `membership-${index}`, name: 'Пакет 8' },
        product: { id: 'product', name: 'Группа 8' },
        pair: null,
      }),
    );
    this.records.membershipTransactions = this.records.studioBookings.map(
      (booking) => ({
        id: `consume-${booking.id}`,
        transactionType: 'CONSUME',
        visitDelta: -1,
        daysDelta: 0,
        occurredAt: '2021-01-01T10:00:00.000Z',
        idempotencyKey: `consume:${booking.id}`,
        reason: 'Посетил',
        bookingId: booking.id,
        membership: booking.membership,
      }),
    );
  }
  project(record: RecordData, selection: RecordData): RecordData {
    const related: Record<string, string> = {
      trainer: 'studioTrainers',
      payRate: 'trainerPayRates',
      classSession: 'classSessions',
      booking: 'studioBookings',
    };
    return Object.fromEntries(
      Object.entries(selection)
        .filter(([key]) => key !== '__args')
        .map(([key, selected]) => {
          let value = record[key];
      if (key === 'previousEntryId' && value == null) value = '';
          if (related[key] && record[key + 'Id'])
            value =
              this.records[related[key]].find(
                ({ id }) => id === record[key + 'Id'],
              ) ?? null;
          if (
            typeof selected === 'object' &&
            selected !== null &&
            value !== null &&
            typeof value === 'object'
          )
            value = this.project(value as RecordData, selected as RecordData);
          return [key, value ?? null];
        }),
    );
  }
  async query(selection: Selection) {
    return Object.fromEntries(
      Object.entries(selection).map(([object, selected]) => {
        const records = this.records[object].filter((record) =>
          Object.entries(selected.__args.filter ?? {}).every(
            ([key, comparison]) =>
              record[key] === (comparison as { eq: unknown }).eq,
          ),
        );
        return [
          object,
          {
            edges: records.map((record) => ({
              node: this.project(
                record,
                (selected.edges as { node: RecordData }).node,
              ),
            })),
          },
        ];
      }),
    );
  }
  async mutation(selection: Selection) {
    const [operation, selected] = Object.entries(selection)[0];
    this.attempts.push(operation);
    if (operation === 'updateClassSessions') {
      const conditions = (selected.__args.filter as { and: Record<string, { eq?: unknown; in?: unknown[]; is?: string }>[] }).and;
      const matched = this.records.classSessions.filter((record) => conditions.every((condition) => Object.entries(condition).every(([key, value]) => value.is === 'NULL' ? record[key] == null : value.in ? value.in.includes(record[key]) : record[key] === value.eq)));
      for (const record of matched) Object.assign(record, selected.__args.data);
      return { updateClassSessions: matched.map((record) => this.project(record, selected)) };
    }
    if (this.failOn === operation) {
      this.failOn = null;
      throw new Error('Connection interrupted');
    }
    const objects: Record<string, string> = {
      createStudioSessionLock: 'studioSessionLocks',
      destroyStudioSessionLock: 'studioSessionLocks',
      createTrainerPayEntry: 'trainerPayEntries',
      updateTrainerPayEntry: 'trainerPayEntries',
      updateClassSession: 'classSessions',
      updateTrainerPayRate: 'trainerPayRates',
      updateStudioBooking: 'studioBookings',
      createStudioEvent: 'studioEvents',
      updateStudioEvent: 'studioEvents',
    };
    const records = this.records[objects[operation]];
    assert.ok(records, `Unexpected mutation ${operation}`);
    let record: RecordData;
    if (operation.startsWith('destroy')) {
      const index = records.findIndex(({ id }) => id === selected.__args.id);
      assert.ok(index >= 0);
      record = records.splice(index, 1)[0];
    } else if (operation.startsWith('update')) {
      record = records.find(({ id }) => id === selected.__args.id)!;
      assert.ok(record);
      Object.assign(record, selected.__args.data);
    } else {
      const key =
        operation === 'createStudioSessionLock'
          ? 'name'
          : operation === 'createStudioEvent'
            ? 'id'
            : 'operationKey';
      if (records.some((entry) => entry[key] === selected.__args.data?.[key]))
        throw new Error('Unique index');
      record = {
        id: `${operation}-${++this.sequence}`,
        ...selected.__args.data,
      };
      records.push(record);
    }
    if (this.loseResponseOn === operation) {
      this.loseResponseOn = null;
      throw new Error('Response lost');
    }
    return { [operation]: this.project(record, selected) };
  }
  asClient() {
    return this as unknown as CoreApiClient;
  }
}
const input = {
  classSessionId: '00000000-0000-4000-8000-000000000001',
  trainerId: 'trainer',
  requestKey: 'request-1',
};
const context = { userWorkspaceId: 'operator' };
const preview = async (client: FakeClient, extra: RecordData = {}) => {
  const result = await closeTrainerCompensation(
    { ...input, ...extra, previewOnly: true },
    context,
    client.asClient(),
  );
  assert.ok(result.success && result.preview, JSON.stringify(result));
  return result;
};
const close = async (client: FakeClient, extra: RecordData = {}) => {
  const calculation = await preview(client, extra);
  const result = await closeTrainerCompensation(
    { ...input, ...extra, previewToken: calculation.previewToken },
    context,
    client.asClient(),
  );
  assert.ok(result.success && !result.preview, JSON.stringify(result));
  return result;
};

test('each of four arbitrary steps is configurable, including the full group', async () => {
  for (const [index, expected] of [700, 1100, 1300, 1650].entries()) {
    const client = new FakeClient(index + 1);
    const result = await preview(client);
    assert.equal(result.snapshot.amount.amountMicros, expected * 1_000_000);
    assert.equal(client.records.trainerPayEntries.length, 0);
  }
});
test('paid absence does not count as attendance and remains in the full journal snapshot', async () => {
  const client = new FakeClient();
  client.records.studioBookings[3].status = 'NO_SHOW';
  const result = await close(client);
  assert.equal(result.amountMicros, 1_300_000_000);
  const entry = client.records.trainerPayEntries[0];
  const snapshot = JSON.parse(entry.snapshot as string) as CompensationSnapshot;
  assert.equal(snapshot.bookings.length, 4);
  assert.equal(snapshot.bookingTransactions.length, 4);
  assert.equal(snapshot.participantCount, 3);
  assert.equal(snapshot.bookings[3].status, 'NO_SHOW');
  assert.equal(snapshot.bookings[0].recordingSource, 'TRAINER');
  assert.equal(snapshot.bookings[0].membership?.name, 'Пакет 8');
  assert.equal(entry.recordedBy, 'operator');
  assert.equal(entry.requestKey, 'request-1');
});
test('four client consumptions produce one expense, repeated requests with a new key do not duplicate it', async () => {
  const client = new FakeClient();
  const first = await close(client);
  const replay = await closeTrainerCompensation(
    { ...input, requestKey: 'new-key' },
    context,
    client.asClient(),
  );
  assert.ok(replay.success && !replay.preview && replay.duplicate);
  assert.equal(replay.entryId, first.entryId);
  assert.equal(client.records.trainerPayEntries.length, 1);
  assert.equal(client.records.studioSessionLocks.length, 0);
});
test('changing attendance after preview requires a new preview', async () => {
  const client = new FakeClient();
  const calculation = await preview(client);
  client.records.studioBookings[3].status = 'LATE_CANCEL';
  const result = await closeTrainerCompensation(
    { ...input, previewToken: calculation.previewToken },
    context,
    client.asClient(),
  );
  assert.ok(!result.success && result.code === 'COMPENSATION_PREVIEW_CHANGED');
  assert.equal(client.records.trainerPayEntries.length, 0);
});
test('incomplete marks, duplicate participants, zero attendance and unsupported formats do not accrue', async () => {
  for (const problem of [
    'BOOKED',
    'duplicate',
    'zero',
    'future',
    'format',
    'inactive',
    'consume',
  ]) {
    const client = new FakeClient();
    if (problem === 'BOOKED')
      client.records.studioBookings[0].status = 'BOOKED';
    if (problem === 'duplicate')
      client.records.studioBookings[1].person =
        client.records.studioBookings[0].person;
    if (problem === 'zero')
      client.records.studioBookings.forEach((booking) => {
        booking.status = 'NO_SHOW';
      });
    if (problem === 'future')
      client.records.classSessions[0].endsAt = '2999-01-01T12:00:00.000Z';
    if (problem === 'format')
      client.records.classSessions[0].sessionFormat = 'PERSONAL';
    if (problem === 'inactive') client.records.studioTrainers[0].active = false;
    if (problem === 'consume') client.records.membershipTransactions = [];
    const result = await closeTrainerCompensation(
      { ...input, previewOnly: true },
      context,
      client.asClient(),
    );
    assert.ok(!result.success, problem);
    assert.equal(client.records.trainerPayEntries.length, 0);
  }
});
test('assignment selection uses the session date and rejects overlaps', async () => {
  const client = new FakeClient();
  client.records.trainerRateAssignments.push({
    ...client.records.trainerRateAssignments[0],
    id: 'future-assignment',
    validFrom: '2025-01-01T00:00:00.000Z',
  });
  assert.equal((await preview(client)).snapshot.assignment.id, 'assignment');
  client.records.trainerRateAssignments[1].validFrom =
    '2020-01-01T00:00:00.000Z';
  const result = await closeTrainerCompensation(
    { ...input, previewOnly: true },
    context,
    client.asClient(),
  );
  assert.ok(!result.success && result.code === 'PAY_RATE_AMBIGUOUS');
});
test('published rate values and closed history do not change when editable rate fields change', async () => {
  const client = new FakeClient();
  client.records.trainerPayRates[0].amountFor4 = {
    amountMicros: 9_000_000_000,
    currencyCode: 'RUB',
  };
  const first = await close(client);
  assert.equal(first.amountMicros, 1_650_000_000);
  const snapshot = client.records.trainerPayEntries[0].snapshot;
  client.records.trainerPayRates[0].version = 2;
  assert.equal(client.records.trainerPayEntries[0].snapshot, snapshot);
});
test('interrupted cache update resumes the saved calculation once', async () => {
  const client = new FakeClient();
  const calculation = await preview(client);
  client.failOn = 'updateClassSession';
  const request = { ...input, previewToken: calculation.previewToken };
  const failed = await closeTrainerCompensation(
    request,
    context,
    client.asClient(),
  );
  assert.ok(!failed.success);
  assert.equal(client.records.trainerPayEntries[0].state, 'PENDING');
  client.records.studioSessionLocks = []; client.records.classSessions[0].mutationLock = null;
  const retried = await closeTrainerCompensation(
    request,
    context,
    client.asClient(),
  );
  assert.ok(retried.success);
  assert.equal(client.records.trainerPayEntries.length, 1);
  assert.equal(client.records.trainerPayEntries[0].state, 'POSTED');
});
test('a lost journal-create response is recovered using the unique operation key', async () => {
  const client = new FakeClient();
  client.loseResponseOn = 'createTrainerPayEntry';
  await close(client);
  assert.equal(client.records.trainerPayEntries.length, 1);
});
test('concurrent closes serialize and cannot double the expense', async () => {
  const client = new FakeClient();
  const calculation = await preview(client);
  const results = await Promise.all(
    [1, 2].map((attempt) =>
      closeTrainerCompensation(
        {
          ...input,
          requestKey: String(attempt),
          previewToken: calculation.previewToken,
        },
        context,
        client.asClient(),
      ),
    ),
  );
  assert.equal(results.filter((result) => result.success).length, 1);
  assert.equal(client.records.trainerPayEntries.length, 1);
});
test('closed classes cannot acquire an attendance write lock', async () => {
  const client = new FakeClient(); await close(client);
  const result = await acquireSessionMutationLock(client.asClient(), { classSessionId: input.classSessionId, operationId: 'new-attendance', kind: 'ATTEND', request: '{}' });
  assert.equal(result.status, 'busy-or-not-editable');
  assert.equal(client.records.trainerPayEntries.length, 1);
});

test('correction adds a reversal and replacement with the original history intact', async () => {
  const client = new FakeClient();
  const first = await close(client);
  const originalSnapshot = client.records.trainerPayEntries[0].snapshot;
  client.records.trainerPayRates[0].publishedSnapshot = JSON.stringify({
    ...rate,
    version: 2,
    amountFor4: { amountMicros: 1_800_000_000, currencyCode: 'RUB' },
  });
  const correction = {
    previousEntryId: first.entryId,
    reason: 'Уточнение ставки',
    requestKey: 'correction',
  };
  const result = await close(client, correction);
  assert.equal(result.amountMicros, 1_800_000_000);
  assert.equal(client.records.trainerPayEntries.length, 3);
  assert.equal(client.records.trainerPayEntries[0].snapshot, originalSnapshot);
  assert.equal(
    client.records.trainerPayEntries.filter(
      ({ entryType }) => entryType === 'REVERSAL',
    ).length,
    1,
  );
  assert.equal(
    client.records.trainerPayEntries.reduce(
      (sum, entry) =>
        sum + Number((entry.amount as { amountMicros: number }).amountMicros),
      0,
    ),
    1_800_000_000,
  );
  const replay = await closeTrainerCompensation(
    { ...input, ...correction },
    context,
    client.asClient(),
  );
  assert.ok(replay.success);
  assert.equal(client.records.trainerPayEntries.length, 3);
});
test('publication requires four valid amounts, allows explicit zero, and is idempotent', async () => {
  const client = new FakeClient();
  const draft = client.records.trainerPayRates[0];
  draft.publishedSnapshot = null;
  draft.publishedAt = null;
  draft.amountFor4 = null;
  const invalid = await publishTrainerPayRate(
    'rate',
    context,
    client.asClient(),
  );
  assert.ok(!invalid.success && invalid.code === 'RATE_AMOUNT_REQUIRED');
  draft.amountFor4 = { amountMicros: 0, currencyCode: 'RUB' };
  assert.ok(
    (await publishTrainerPayRate('rate', context, client.asClient())).success,
  );
  const published = draft.publishedSnapshot;
  draft.amountFor4 = { amountMicros: 5_000_000_000, currencyCode: 'RUB' };
  assert.ok(
    (await publishTrainerPayRate('rate', context, client.asClient())).success,
  );
  assert.equal(draft.publishedSnapshot, published);
});

test('attendance correction keeps client consumption but changes the trainer expense with a full audit trail', async () => {
  const client = new FakeClient();
  const first = await close(client);
  const result = await close(client, {
    previousEntryId: first.entryId,
    reason: 'Клиент не пришёл',
    attendanceCorrections: [{ bookingId: 'booking-3', status: 'NO_SHOW' }],
  });
  assert.equal(result.amountMicros, 1_300_000_000);
  assert.equal(client.records.studioBookings[3].status, 'NO_SHOW');
  assert.equal(client.records.membershipTransactions.length, 4);
  const snapshot = JSON.parse(
    client.records.trainerPayEntries.find(
      (entry) => entry.revision === 2 && entry.entryType === 'ACCRUAL',
    )!.snapshot as string,
  ) as CompensationSnapshot;
  assert.deepEqual(snapshot.attendanceCorrections, [
    { bookingId: 'booking-3', before: 'ATTENDED', status: 'NO_SHOW' },
  ]);
});
test('lost session-lock creation and release responses are recovered without leaving a lock', async () => {
  for (const operation of [
    'createStudioSessionLock',
    'destroyStudioSessionLock',
  ]) {
    const client = new FakeClient();
    client.loseResponseOn = operation;
    await close(client);
    assert.equal(client.records.studioSessionLocks.length, 0);
  }
});
test('correction retries after a posted reversal without duplicating it', async () => {
  const client = new FakeClient();
  const first = await close(client);
  const correction = {
    previousEntryId: first.entryId,
    reason: 'Ошибка посещения',
    attendanceCorrections: [
      { bookingId: 'booking-3', status: 'NO_SHOW' as const },
    ],
  };
  const calculation = await preview(client, correction);
  const originalMutation = client.mutation.bind(client);
  let failOnce = true;
  client.mutation = async (selection: Selection) => {
    const [operation, selected] = Object.entries(selection)[0];
    const current = client.records.trainerPayEntries.find(
      ({ id }) => id === selected.__args.id,
    );
    if (
      failOnce &&
      operation === 'updateTrainerPayEntry' &&
      current?.entryType === 'ACCRUAL'
    ) {
      failOnce = false;
      throw new Error('Connection interrupted');
    }
    return originalMutation(selection);
  };
  const request = {
    ...input,
    ...correction,
    previewToken: calculation.previewToken,
  };
  assert.ok(
    !(await closeTrainerCompensation(request, context, client.asClient()))
      .success,
  );
  client.records.studioSessionLocks = []; client.records.classSessions[0].mutationLock = null;
  assert.ok(
    (await closeTrainerCompensation(request, context, client.asClient())).success,
  );
  assert.equal(client.records.trainerPayEntries.length, 3);
  assert.equal(
    client.records.trainerPayEntries.filter(
      ({ entryType }) => entryType === 'REVERSAL',
    ).length,
    1,
  );
});

test('resuming a pending accrual uses its frozen tariff rather than a changed assignment', async () => {
  const client = new FakeClient();
  const calculation = await preview(client);
  client.failOn = 'updateClassSession';
  const request = { ...input, previewToken: calculation.previewToken };
  assert.ok(
    !(await closeTrainerCompensation(request, context, client.asClient()))
      .success,
  );
  client.records.studioSessionLocks = []; client.records.classSessions[0].mutationLock = null;
  client.records.trainerRateAssignments[0].validUntil =
    '2020-12-01T00:00:00.000Z';
  client.records.trainerPayRates[0].publishedSnapshot = JSON.stringify({
    ...rate,
    amountFor4: { amountMicros: 9_000_000_000, currencyCode: 'RUB' },
  });
  const result = await closeTrainerCompensation(
    request,
    context,
    client.asClient(),
  );
  assert.ok(result.success && !result.preview);
  assert.equal(result.amountMicros, 1_650_000_000);
});

test('assigns one active trainer and journals the previous and new trainer with the operator', async () => {
  const client = new FakeClient();
  client.records.studioTrainers.push({
    id: 'substitute',
    name: 'Замена',
    active: true,
  });
  const request = {
    classSessionId: '00000000-0000-4000-8000-000000000001',
    trainerId: 'substitute',
    requestKey: crypto.randomUUID(),
  };
  const result = await assignSessionTrainer(
    request,
    context,
    client.asClient(),
  );
  assert.ok(result.success, JSON.stringify(result));
  assert.equal(client.records.classSessions[0].trainerId, 'substitute');
  assert.equal(client.records.studioEvents[0].outcome, 'SUCCESS');
  const audit = JSON.parse(client.records.studioEvents[0].details as string);
  assert.equal(audit.previousTrainer.id, 'trainer');
  assert.equal(audit.trainer.id, 'substitute');
  assert.equal(audit.recordedBy, 'operator');
  assert.ok(
    (await assignSessionTrainer(request, context, client.asClient())).success,
  );
  assert.equal(client.records.studioEvents.length, 1);
});
test('assignment rejects inactive trainers and closed classes', async () => {
  const client = new FakeClient();
  const request = {
    classSessionId: '00000000-0000-4000-8000-000000000001',
    trainerId: 'trainer',
    requestKey: crypto.randomUUID(),
  };
  client.records.studioTrainers[0].active = false;
  const inactive = await assignSessionTrainer(
    request,
    context,
    client.asClient(),
  );
  assert.ok(!inactive.success && inactive.code === 'TRAINER_NOT_ACTIVE');
  client.records.studioTrainers[0].active = true;
  await close(client);
  const closed = await assignSessionTrainer(
    request,
    context,
    client.asClient(),
  );
  assert.ok(!closed.success && closed.code === 'SESSION_COMPENSATION_LOCKED');
});
test('assignment resumes after a failed trainer update without losing the previous trainer audit', async () => {
  const client = new FakeClient();
  client.records.studioTrainers.push({
    id: 'substitute',
    name: 'Замена',
    active: true,
  });
  const request = {
    classSessionId: '00000000-0000-4000-8000-000000000001',
    trainerId: 'substitute',
    requestKey: crypto.randomUUID(),
  };
  client.failOn = 'updateClassSession';
  assert.ok(
    !(await assignSessionTrainer(request, context, client.asClient())).success,
  );
  assert.equal(client.records.studioEvents[0].outcome, 'PENDING');
  client.records.studioSessionLocks = []; client.records.classSessions[0].mutationLock = null;
  assert.ok((await assignSessionTrainer(request, context, client.asClient())).success);
  assert.equal(client.records.classSessions[0].trainerId, 'substitute');
  assert.equal(client.records.studioEvents.length, 1);
  assert.equal(client.records.studioEvents[0].outcome, 'SUCCESS');
});
test('assignment key cannot be reused for a different trainer', async () => {
  const client = new FakeClient();
  client.records.studioTrainers.push({
    id: 'substitute',
    name: 'Замена',
    active: true,
  });
  const request = {
    classSessionId: '00000000-0000-4000-8000-000000000001',
    trainerId: 'trainer',
    requestKey: crypto.randomUUID(),
  };
  assert.ok(
    (await assignSessionTrainer(request, context, client.asClient())).success,
  );
  const changed = await assignSessionTrainer(
    { ...request, trainerId: 'substitute' },
    context,
    client.asClient(),
  );
  assert.ok(!changed.success && changed.code === 'IDEMPOTENCY_CONFLICT');
});

test('payroll defaults to the catalog trainer already assigned to the class', async () => {
  const client = new FakeClient();
  const result = await closeTrainerCompensation(
    { classSessionId: '00000000-0000-4000-8000-000000000001', requestKey: 'payroll', previewOnly: true },
    context,
    client.asClient(),
  );
  assert.ok(result.success && result.preview);
  assert.equal(result.snapshot.session.trainer?.id, 'trainer');
});
test('a pending assignment prevents salary accrual until it is completed', async () => {
  const client = new FakeClient();
  client.records.studioTrainers.push({
    id: 'substitute',
    name: 'Замена',
    active: true,
  });
  const request = {
    classSessionId: '00000000-0000-4000-8000-000000000001',
    trainerId: 'substitute',
    requestKey: crypto.randomUUID(),
  };
  client.failOn = 'updateClassSession';
  assert.ok(
    !(await assignSessionTrainer(request, context, client.asClient())).success,
  );
  const result = await closeTrainerCompensation(
    { ...input, previewOnly: true },
    context,
    client.asClient(),
  );
  assert.ok(!result.success && result.code === 'TRAINER_ASSIGNMENT_PENDING');
});

test('salary accrues to the trainer assigned to the session and is summarized under that trainer', async () => {
  const client = new FakeClient();
  client.records.studioTrainers.push({
    id: 'substitute',
    name: 'Замена',
    active: true,
  });
  client.records.trainerRateAssignments.push({
    ...client.records.trainerRateAssignments[0],
    id: 'substitute-assignment',
    trainerId: 'substitute',
  });
  const request = {
    classSessionId: '00000000-0000-4000-8000-000000000001',
    trainerId: 'substitute',
    requestKey: crypto.randomUUID(),
  };
  assert.ok(
    (await assignSessionTrainer(request, context, client.asClient())).success,
  );
  const calculation = await closeTrainerCompensation(
    { classSessionId: '00000000-0000-4000-8000-000000000001', requestKey: 'payroll', previewOnly: true },
    context,
    client.asClient(),
  );
  assert.ok(calculation.success && calculation.preview);
  const result = await closeTrainerCompensation(
    {
      classSessionId: '00000000-0000-4000-8000-000000000001',
      requestKey: 'payroll',
      previewToken: calculation.previewToken,
    },
    context,
    client.asClient(),
  );
  assert.ok(result.success);
  assert.equal(client.records.trainerPayEntries[0].trainerId, 'substitute');
  const journal = client.records.trainerPayEntries.map((entry) => ({
    id: entry.id as string,
    revision: entry.revision as number,
    entryType: entry.entryType as string,
    state: entry.state as string,
    snapshot: entry.snapshot as string,
    classSession: { id: '00000000-0000-4000-8000-000000000001' },
  }));
  assert.equal(
    summarizeTrainerCompensation(
      journal,
      'substitute',
      '2021-01-01',
      '2021-02-01',
    ).amountMicros,
    1_650_000_000,
  );
  assert.equal(
    summarizeTrainerCompensation(journal, 'trainer', '2021-01-01', '2021-02-01')
      .amountMicros,
    0,
  );
});


const personalClient = (participants = 1) => {
  const client = new FakeClient(participants);
  Object.assign(client.records.classSessions[0], { sessionFormat: 'PERSONAL_EQUIPMENT', capacity: 1 });
  const personalRate: CompensationRate = { ...rate, id: 'personal-rate', name: 'Персональные', sessionFormat: 'PERSONAL_EQUIPMENT', amountFor1: { amountMicros: 1_600_000_000, currencyCode: 'RUB' }, amountFor2: null, amountFor3: null, amountFor4: null };
  client.records.trainerPayRates.push({ ...personalRate, publishedAt: '2020-01-01T00:00:00.000Z', publishedSnapshot: JSON.stringify(personalRate) });
  client.records.trainerRateAssignments.push({ ...client.records.trainerRateAssignments[0], id: 'personal-assignment', payRateId: 'personal-rate' });
  return client;
};
test('personal payroll selects its own rate alongside a group assignment and posts once', async () => {
  const client = personalClient();
  const calculation = await preview(client);
  assert.equal(calculation.snapshot.amount.amountMicros, 1_600_000_000);
  assert.equal(calculation.snapshot.participantCount, 1);
  assert.equal(calculation.snapshot.rate.id, 'personal-rate');
  const result = await closeTrainerCompensation({ ...input, previewToken: calculation.previewToken }, context, client.asClient());
  assert.ok(result.success);
  const duplicate = await closeTrainerCompensation({ ...input, previewToken: calculation.previewToken }, context, client.asClient());
  assert.ok(duplicate.success && duplicate.duplicate);
  assert.equal(client.records.trainerPayEntries.length, 1);
  assert.equal(client.records.membershipTransactions.length, 1);
});
test('personal payroll rejects multiple attendees, excess capacity, absence and missing amount', async () => {
  for (const problem of ['attendees', 'capacity', 'absence', 'amount']) {
    const client = personalClient(problem === 'attendees' ? 2 : 1);
    if (problem === 'capacity') client.records.classSessions[0].capacity = 2;
    if (problem === 'absence') client.records.studioBookings[0].status = 'NO_SHOW';
    if (problem === 'amount') {
      const saved = JSON.parse(client.records.trainerPayRates[1].publishedSnapshot as string) as CompensationRate;
      saved.amountFor1 = null;
      client.records.trainerPayRates[1].publishedSnapshot = JSON.stringify(saved);
    }
    const result = await closeTrainerCompensation({ ...input, previewOnly: true }, context, client.asClient());
    assert.ok(!result.success, problem);
    assert.equal(client.records.trainerPayEntries.length, 0);
  }
});
