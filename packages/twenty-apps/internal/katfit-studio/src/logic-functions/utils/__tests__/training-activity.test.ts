import assert from 'node:assert/strict';
import { test } from 'node:test';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import {
  calculateTrainingActivity,
  recomputeTrainingActivity,
  recomputeBookingTrainingActivity,
  recomputeSessionTrainingActivity,
  type ActivityBooking,
  type TrainingActivityEvent,
} from '../training-activity.ts';

const NOW = new Date('2026-11-01T09:00:00Z');
const booking = (
  status = 'ATTENDED',
  startsAt = '2026-10-31T09:00:00Z',
  sessionStatus = 'COMPLETED',
): ActivityBooking => ({
  personId: 'client',
  status,
  classSession: {
    status: sessionStatus,
    startsAt,
    endsAt: new Date(Date.parse(startsAt) + 3600000).toISOString(),
  },
});

test('new clients, cancellations and no-shows do not count as attendance', () => {
  assert.equal(calculateTrainingActivity([], NOW), 'NOT_STARTED');
  for (const status of [
    'NO_SHOW',
    'LATE_CANCEL',
    'CANCELLED_IN_TIME',
    'CANCELLED_BY_STUDIO',
  ]) {
    assert.equal(
      calculateTrainingActivity([booking(status)], NOW),
      'NOT_STARTED',
    );
  }
  assert.equal(
    calculateTrainingActivity([booking('BOOKED')], NOW),
    'NOT_STARTED',
  );
  assert.equal(
    calculateTrainingActivity([{ ...booking(), classSession: null }], NOW),
    'NOT_STARTED',
  );
});

test('pauses only after more than fourteen days since attendance', () => {
  assert.equal(
    calculateTrainingActivity(
      [booking('ATTENDED', '2026-10-18T09:00:00Z')],
      NOW,
    ),
    'ACTIVE',
  );
  assert.equal(
    calculateTrainingActivity(
      [booking('ATTENDED', '2026-10-18T08:59:59Z')],
      NOW,
    ),
    'PAUSED',
  );
  assert.equal(
    calculateTrainingActivity(
      [booking('ATTENDED', '2026-10-01T09:00:00Z'), booking()],
      NOW,
    ),
    'ACTIVE',
  );
});

test('future and ongoing bookings activate clients, including clients without attendance', () => {
  for (const status of ['PLANNED', 'CONFIRMED']) {
    assert.equal(
      calculateTrainingActivity(
        [booking('BOOKED', '2026-11-02T09:00:00Z', status)],
        NOW,
      ),
      'ACTIVE',
    );
    assert.equal(
      calculateTrainingActivity(
        [booking('BOOKED', '2026-11-01T08:30:00Z', status)],
        NOW,
      ),
      'ACTIVE',
    );
  }
  assert.equal(
    calculateTrainingActivity(
      [
        booking('ATTENDED', '2026-10-01T09:00:00Z'),
        booking('BOOKED', '2026-11-02T09:00:00Z', 'CONFIRMED'),
      ],
      NOW,
    ),
    'ACTIVE',
  );
});

test('cancelled sessions and future attendance do not activate clients', () => {
  assert.equal(
    calculateTrainingActivity(
      [booking('BOOKED', '2026-11-02T09:00:00Z', 'CANCELLED_BY_STUDIO')],
      NOW,
    ),
    'NOT_STARTED',
  );
  assert.equal(
    calculateTrainingActivity(
      [booking('ATTENDED', '2026-11-02T09:00:00Z')],
      NOW,
    ),
    'NOT_STARTED',
  );
  assert.equal(
    calculateTrainingActivity(
      [booking('ATTENDED', '2026-10-31T09:00:00Z', 'CANCELLED_BY_STUDIO')],
      NOW,
    ),
    'NOT_STARTED',
  );
});

type Selection = Record<
  string,
  {
    __args: {
      after?: string;
      filter?: Record<string, { in: string[] }>;
      id?: string;
      data?: { trainingActivity: string; lifecycleStatus?: string };
    };
  }
>;
const fixture = () => {
  const writes: {
    id?: string;
    data?: { trainingActivity: string; lifecycleStatus?: string };
  }[] = [];
  const queries: Selection[] = [];
  let incomplete = false;
  let unconfirmed = false;
  let unconfirmedLifecycle = false;
  const people = [
    {
      id: 'client',
      trainingActivity: 'PAUSED',
      lifecycleStatus: 'CONTACTED' as string | null,
    },
    {
      id: 'new',
      trainingActivity: 'NOT_STARTED',
      lifecycleStatus: 'LEAD' as string | null,
    },
  ];
  let bookings = [
    booking('ATTENDED', '2020-01-01T00:00:00Z'),
    booking('BOOKED', '2099-01-01T00:00:00Z', 'CONFIRMED'),
  ];
  const client = {
    query: async (selection: Selection) => {
      queries.push(selection);
      const key = Object.keys(selection)[0];
      if (incomplete) return { [key]: { edges: [] } };
      const { after, filter } = selection[key].__args;
      const records =
        key === 'people'
          ? people.filter(
              (person) => !filter?.id || filter.id.in.includes(person.id),
            )
          : bookings.filter(
              (entry) =>
                !filter?.personId ||
                filter.personId.in.includes(entry.personId ?? ''),
            );
      const index = after ? Number(after) : 0;
      return {
        [key]: {
          edges: records.slice(index, index + 1).map((node) => ({ node })),
          pageInfo: {
            hasNextPage: index + 1 < records.length,
            endCursor: String(index + 1),
          },
        },
      };
    },
    mutation: async (selection: Selection) => {
      const input = selection.updatePerson.__args;
      writes.push(input);
      if (unconfirmed) return {};
      const person = people.find(({ id }) => id === input.id);
      if (person && input.data) Object.assign(person, input.data);
      return {
        updatePerson: {
          ...person,
          ...(unconfirmedLifecycle ? { lifecycleStatus: 'CONTACTED' } : {}),
        },
      };
    },
  } as unknown as CoreApiClient;
  return {
    client,
    writes,
    queries,
    people,
    setUnconfirmedLifecycle: () => {
      unconfirmedLifecycle = true;
    },
    setIncomplete: () => {
      incomplete = true;
    },
    setUnconfirmed: () => {
      unconfirmed = true;
    },
    setBookings: (value: ActivityBooking[]) => {
      bookings = value;
    },
  };
};

test('reconciles every people and booking page and writes only changes', async () => {
  const { client, writes, queries } = fixture();
  await recomputeTrainingActivity(client, undefined, NOW);
  assert.deepEqual(writes, [
    {
      id: 'client',
      data: { trainingActivity: 'ACTIVE', lifecycleStatus: 'ACTIVE_CLIENT' },
    },
  ]);
  assert.equal(queries.filter((query) => query.people).length, 2);
  assert.equal(queries.filter((query) => query.studioBookings).length, 3);
  await recomputeTrainingActivity(client, undefined, NOW);
  assert.equal(writes.length, 1);
});

test('cancellation of the last future booking pauses a former attendee', async () => {
  const { client, writes, setBookings } = fixture();
  await recomputeTrainingActivity(client, undefined, NOW);
  setBookings([
    booking('ATTENDED', '2020-01-01T00:00:00Z'),
    booking('CANCELLED_IN_TIME', '2099-01-01T00:00:00Z', 'CONFIRMED'),
  ]);
  await recomputeTrainingActivity(client, undefined, NOW);
  assert.deepEqual(
    writes.map(({ data }) => data),
    [
      { trainingActivity: 'ACTIVE', lifecycleStatus: 'ACTIVE_CLIENT' },
      { trainingActivity: 'PAUSED', lifecycleStatus: 'PAUSED' },
    ],
  );
});

test('fails closed on incomplete reads and unconfirmed writes', async () => {
  const incomplete = fixture();
  incomplete.setIncomplete();
  await assert.rejects(
    recomputeTrainingActivity(incomplete.client, undefined, NOW),
  );
  assert.equal(incomplete.writes.length, 0);
  const unconfirmed = fixture();
  unconfirmed.setUnconfirmed();
  await assert.rejects(
    recomputeTrainingActivity(unconfirmed.client, undefined, NOW),
  );
});

const event = (properties: object, recordId = 'session') =>
  ({ properties, recordId }) as unknown as TrainingActivityEvent;

test('booking reassignment recomputes both previous and new clients', async () => {
  const { client, queries } = fixture();
  await recomputeBookingTrainingActivity(
    client,
    event({ before: { personId: 'old' }, after: { personId: 'new' } }),
  );
  assert.deepEqual(queries[0].people.__args.filter, {
    id: { in: ['old', 'new'] },
  });
});

test('booking create, destroy and restore recompute affected clients', async () => {
  for (const properties of [
    { before: { personId: 'client' } },
    { after: { personId: 'client' } },
  ]) {
    const { client, queries } = fixture();
    await recomputeBookingTrainingActivity(client, event(properties));
    assert.deepEqual(queries[0].people.__args.filter, {
      id: { in: ['client'] },
    });
  }
});

test('session changes discover all affected clients before recalculating', async () => {
  const { client, queries } = fixture();
  await recomputeSessionTrainingActivity(client, event({}));
  assert.deepEqual(queries[0].studioBookings.__args.filter, {
    classSessionId: { eq: 'session' },
  });
  assert.deepEqual(queries[2].people.__args.filter, { id: { in: ['client'] } });
});

test('events without a client perform no reads or writes', async () => {
  const { client, queries, writes } = fixture();
  await recomputeBookingTrainingActivity(client, event({ after: {} }));
  assert.equal(queries.length, 0);
  assert.equal(writes.length, 0);
});

test('first attended training fixes a forgotten contacted status even when activity is already active', async () => {
  const { client, writes, people, setBookings } = fixture();
  people[0].trainingActivity = 'ACTIVE';
  setBookings([booking()]);
  await recomputeTrainingActivity(client, ['client'], NOW);
  assert.equal(people[0].lifecycleStatus, 'ACTIVE_CLIENT');
  assert.deepEqual(writes, [
    {
      id: 'client',
      data: { trainingActivity: 'ACTIVE', lifecycleStatus: 'ACTIVE_CLIENT' },
    },
  ]);
  await recomputeTrainingActivity(client, ['client'], NOW);
  assert.equal(writes.length, 1);
});

test('future and ongoing bookings reactivate a paused client without waiting for attendance or payment', async () => {
  for (const startsAt of ['2026-11-02T09:00:00Z', '2026-11-01T08:30:00Z']) {
    const { client, people, setBookings } = fixture();
    people[0].lifecycleStatus = 'PAUSED';
    setBookings([booking('BOOKED', startsAt, 'CONFIRMED')]);
    await recomputeTrainingActivity(client, ['client'], NOW);
    assert.equal(people[0].trainingActivity, 'ACTIVE');
    assert.equal(people[0].lifecycleStatus, 'ACTIVE_CLIENT');
  }
});

test('daily reconciliation fixes lifecycle drift for an already paused activity', async () => {
  const { client, writes, people, setBookings } = fixture();
  people[0].lifecycleStatus = 'ACTIVE_CLIENT';
  setBookings([booking('ATTENDED', '2026-10-01T09:00:00Z')]);
  await recomputeTrainingActivity(client, undefined, NOW);
  assert.equal(people[0].lifecycleStatus, 'PAUSED');
  assert.deepEqual(writes, [
    {
      id: 'client',
      data: { trainingActivity: 'PAUSED', lifecycleStatus: 'PAUSED' },
    },
  ]);
});

test('no attendance or valid bookings preserves the existing lifecycle and never invents a former lead stage', async () => {
  for (const lifecycleStatus of [
    'WAITLIST',
    'LEAD',
    'CONTACTED',
    'INTRO_BOOKED',
    'INTRO_ATTENDED',
    'ACTIVE_CLIENT',
    'PAUSED',
    'CHURNED',
    'RE_ENGAGEMENT',
    null,
  ]) {
    const { client, writes, people, setBookings } = fixture();
    people[0].trainingActivity = 'ACTIVE';
    people[0].lifecycleStatus = lifecycleStatus;
    setBookings([
      booking('CANCELLED_IN_TIME', '2026-11-02T09:00:00Z', 'CONFIRMED'),
    ]);
    await recomputeTrainingActivity(client, ['client'], NOW);
    assert.equal(people[0].trainingActivity, 'NOT_STARTED');
    assert.equal(people[0].lifecycleStatus, lifecycleStatus);
    assert.deepEqual(writes, [
      { id: 'client', data: { trainingActivity: 'NOT_STARTED' } },
    ]);
  }
});

test('a successful response must confirm the primary lifecycle update as well as training activity', async () => {
  const { client, setUnconfirmedLifecycle } = fixture();
  setUnconfirmedLifecycle();
  await assert.rejects(
    recomputeTrainingActivity(client, ['client'], NOW),
    /not confirmed/,
  );
});
