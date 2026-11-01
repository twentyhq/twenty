import { type CoreApiClient } from 'twenty-client-sdk/core';
import {
  type DatabaseEventPayload,
  type ObjectRecordEvent,
} from 'twenty-sdk/define';

import { type CLIENT_LIFECYCLE_OPTIONS } from 'src/constants/select-options';

export const TRAINING_INACTIVITY_DAYS = 14;
const PAGE_SIZE = 100;

export type TrainingActivity = 'NOT_STARTED' | 'ACTIVE' | 'PAUSED';
export type ActivityBooking = {
  personId: string | null;
  status: string;
  classSession: {
    status: string;
    startsAt: string;
    endsAt: string;
  } | null;
};
type ClientLifecycleStatus = (typeof CLIENT_LIFECYCLE_OPTIONS)[number]['value'];
type ActivityPerson = {
  id: string;
  trainingActivity: TrainingActivity | null;
  lifecycleStatus: ClientLifecycleStatus | null;
};
type ActivityConnection<TData> = {
  edges: { node: TData }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};
export type TrainingActivityEvent = DatabaseEventPayload<
  ObjectRecordEvent<{ personId?: string | null }>
>;

export const calculateTrainingActivity = (
  bookings: ActivityBooking[],
  now: Date,
): TrainingActivity => {
  const currentTime = now.getTime();
  const cutoff = currentTime - TRAINING_INACTIVITY_DAYS * 24 * 60 * 60 * 1000;
  let hasAttended = false;

  for (const booking of bookings) {
    const session = booking.classSession;
    if (!session || session.status === 'CANCELLED_BY_STUDIO') continue;
    const startsAt = Date.parse(session.startsAt);
    const endsAt = Date.parse(session.endsAt);
    if (!Number.isFinite(startsAt) || !Number.isFinite(endsAt)) {
      throw new Error('Invalid training activity session dates');
    }
    if (
      booking.status === 'BOOKED' &&
      ['PLANNED', 'CONFIRMED'].includes(session.status) &&
      endsAt >= currentTime
    )
      return 'ACTIVE';
    if (booking.status === 'ATTENDED' && startsAt <= currentTime) {
      hasAttended = true;
      if (startsAt >= cutoff) return 'ACTIVE';
    }
  }

  return hasAttended ? 'PAUSED' : 'NOT_STARTED';
};

// A truncated inventory could incorrectly pause clients who still have bookings.
const readActivityPages = async function* <TData>(
  client: CoreApiClient,
  objectName: string,
  filter: object,
  fields: object,
): AsyncGenerator<TData[]> {
  let after: string | undefined;
  do {
    const result = (await client.query({
      [objectName]: {
        __args: {
          filter,
          first: PAGE_SIZE,
          after,
          orderBy: [{ id: 'AscNullsLast' }],
        },
        edges: { node: fields },
        pageInfo: { hasNextPage: true, endCursor: true },
      },
    } as never)) as unknown as Record<string, ActivityConnection<TData>>;
    const connection = result[objectName];
    if (
      !connection?.edges ||
      typeof connection.pageInfo?.hasNextPage !== 'boolean'
    ) {
      throw new Error(`Incomplete training activity inventory: ${objectName}`);
    }
    const { hasNextPage, endCursor } = connection.pageInfo;
    if (hasNextPage && (!endCursor || endCursor === after)) {
      throw new Error(`Invalid training activity cursor: ${objectName}`);
    }
    yield connection.edges.map(({ node }) => node);
    if (!hasNextPage) return;
    after = endCursor ?? undefined;
  } while (after);
};

export const recomputeTrainingActivity = async (
  client: CoreApiClient,
  personIds?: string[],
  now = new Date(),
): Promise<void> => {
  if (personIds?.length === 0) return;
  for await (const people of readActivityPages<ActivityPerson>(
    client,
    'people',
    personIds ? { id: { in: personIds } } : {},
    { id: true, trainingActivity: true, lifecycleStatus: true },
  )) {
    if (people.length === 0) continue;
    const bookingsByPerson = new Map<string, ActivityBooking[]>();
    for await (const bookings of readActivityPages<ActivityBooking>(
      client,
      'studioBookings',
      { personId: { in: people.map(({ id }) => id) } },
      {
        personId: true,
        status: true,
        classSession: { status: true, startsAt: true, endsAt: true },
      },
    )) {
      for (const booking of bookings) {
        if (!booking.personId) continue;
        const personBookings = bookingsByPerson.get(booking.personId) ?? [];
        personBookings.push(booking);
        bookingsByPerson.set(booking.personId, personBookings);
      }
    }
    for (const person of people) {
      const trainingActivity = calculateTrainingActivity(
        bookingsByPerson.get(person.id) ?? [],
        now,
      );
      const lifecycleStatus: ClientLifecycleStatus | undefined =
        trainingActivity === 'ACTIVE'
          ? 'ACTIVE_CLIENT'
          : trainingActivity === 'PAUSED'
            ? 'PAUSED'
            : undefined;
      if (
        person.trainingActivity === trainingActivity &&
        (lifecycleStatus === undefined ||
          person.lifecycleStatus === lifecycleStatus)
      )
        continue;
      const result = (await client.mutation({
        updatePerson: {
          __args: {
            id: person.id,
            data: {
              trainingActivity,
              ...(lifecycleStatus === undefined ? {} : { lifecycleStatus }),
            },
          },
          id: true,
          trainingActivity: true,
          lifecycleStatus: true,
        },
      } as never)) as unknown as { updatePerson?: ActivityPerson };
      if (
        result.updatePerson?.id !== person.id ||
        result.updatePerson.trainingActivity !== trainingActivity ||
        (lifecycleStatus !== undefined &&
          result.updatePerson.lifecycleStatus !== lifecycleStatus)
      ) {
        throw new Error('Training activity update was not confirmed');
      }
    }
  }
};

export const recomputeBookingTrainingActivity = async (
  client: CoreApiClient,
  event: TrainingActivityEvent,
): Promise<void> => {
  const personIds = new Set<string>();
  const properties = event.properties;
  const before = 'before' in properties ? properties.before : undefined;
  const after = 'after' in properties ? properties.after : undefined;
  for (const personId of [before?.personId, after?.personId]) {
    if (personId) personIds.add(personId);
  }
  await recomputeTrainingActivity(client, [...personIds]);
};

export const recomputeSessionTrainingActivity = async (
  client: CoreApiClient,
  event: TrainingActivityEvent,
): Promise<void> => {
  const personIds = new Set<string>();
  for await (const bookings of readActivityPages<{ personId: string | null }>(
    client,
    'studioBookings',
    { classSessionId: { eq: event.recordId } },
    { personId: true },
  )) {
    for (const booking of bookings) {
      if (booking.personId) personIds.add(booking.personId);
    }
  }
  await recomputeTrainingActivity(client, [...personIds]);
};
