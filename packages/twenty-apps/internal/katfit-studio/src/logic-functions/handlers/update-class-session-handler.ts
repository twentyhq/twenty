import { createHash } from 'node:crypto';

import { isObject } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { studioDate } from 'src/logic-functions/utils/studio-date';

import { SESSION_FORMAT_OPTIONS } from 'src/constants/select-options';
import {
  failBookingOperation,
  isValidBookingOperationInput,
  runBookingOperation,
} from 'src/logic-functions/utils/run-booking-operation';

export type SessionSchedule = {
  name: string;
  startsAt: string;
  endsAt: string;
  sessionFormat: string;
  capacity: number;
};
export type UpdateClassSessionInput = {
  classSessionId: string;
  idempotencyKey: string;
  expected: SessionSchedule & {
    status: 'PLANNED' | 'CONFIRMED';
    recordingKey?: string;
  };
  target: SessionSchedule;
};
export type UpdateClassSessionResult =
  | { success: true; duplicate: boolean; classSessionId: string }
  | { success: false; status: number; code: string; message: string };
const isRecord = isObject<Record<string, unknown>, unknown>;
const fields = {
  id: true,
  name: true,
  startsAt: true,
  endsAt: true,
  sessionFormat: true,
  capacity: true,
  status: true,
  mutationLock: true,
  recordingKey: true,
};
const validSchedule = (value: unknown): value is SessionSchedule => {
  if (
    !isRecord(value) ||
    typeof value.name !== 'string' ||
    !value.name.trim() ||
    value.name.length > 200 ||
    /[\x00-\x1f\x7f]/.test(value.name) ||
    typeof value.startsAt !== 'string' ||
    typeof value.endsAt !== 'string' ||
    !/T.*(?:Z|[+-]\d\d:\d\d)$/.test(value.startsAt) ||
    !/T.*(?:Z|[+-]\d\d:\d\d)$/.test(value.endsAt) ||
    !SESSION_FORMAT_OPTIONS.some(
      (option) => option.value === value.sessionFormat,
    ) ||
    typeof value.capacity !== 'number' ||
    !Number.isInteger(value.capacity) ||
    value.capacity < 1 ||
    value.capacity > 100
  )
    return false;
  const minutes =
    (Date.parse(value.endsAt) - Date.parse(value.startsAt)) / 60000;
  return (
    Number.isInteger(minutes) &&
    minutes >= 1 &&
    minutes <= 1440 &&
    (value.sessionFormat !== 'PERSONAL_EQUIPMENT' || value.capacity === 1) &&
    (value.sessionFormat !== 'SPLIT_EQUIPMENT' || value.capacity === 2)
  );
};
const rows = (result: unknown, key: string): Record<string, unknown>[] => {
  if (
    !isRecord(result) ||
    result.errors !== undefined ||
    !isRecord(result[key])
  )
    throw Error('Unconfirmed query');
  const connection = result[key];
  if (
    !Array.isArray(connection.edges) ||
    !isRecord(connection.pageInfo) ||
    connection.pageInfo.hasNextPage !== false ||
    connection.edges.length >= 1000
  )
    throw Error('Incomplete inventory');
  return connection.edges.map((edge: unknown) => {
    if (!isRecord(edge) || !isRecord(edge.node))
      throw Error('Invalid inventory');
    return edge.node;
  });
};
const same = (
  row: Record<string, unknown>,
  schedule: SessionSchedule & { status?: string; recordingKey?: string },
): boolean =>
  Object.entries(schedule).every(([key, value]) =>
    key === 'startsAt' || key === 'endsAt'
      ? typeof row[key] === 'string' &&
        Date.parse(row[key]) === Date.parse(String(value))
      : row[key] === value,
  );
const readSession = async (client: CoreApiClient, id: string) => {
  const found = rows(
    await client.query({
      classSessions: {
        __args: { filter: { id: { eq: id } }, first: 2 },
        edges: { node: fields },
        pageInfo: { hasNextPage: true },
      },
    } as never),
    'classSessions',
  );
  if (
    found.length !== 1 ||
    found[0].id !== id ||
    !validSchedule(found[0]) ||
    typeof (found[0] as Record<string, unknown>).mutationLock !== 'string'
  )
    throw Error('Session unavailable');
  return found[0] as Record<string, unknown>;
};

export const updateClassSession = async (
  rawInput: UpdateClassSessionInput,
  client = new CoreApiClient(),
  now = new Date(),
): Promise<UpdateClassSessionResult> => {
  if (
    !isRecord(rawInput) ||
    !isValidBookingOperationInput(rawInput.idempotencyKey, [
      rawInput.classSessionId,
    ]) ||
    !validSchedule(rawInput.expected) ||
    !validSchedule(rawInput.target) ||
    !['PLANNED', 'CONFIRMED'].includes(rawInput.expected.status) ||
    (rawInput.expected.recordingKey !== undefined &&
      (typeof rawInput.expected.recordingKey !== 'string' ||
        !rawInput.expected.recordingKey ||
        rawInput.expected.recordingKey.length > 200)) ||
    !Number.isFinite(now.getTime())
  )
    return failBookingOperation('INVALID_SCHEDULE_INPUT', 400);
  const command: UpdateClassSessionInput = {
    classSessionId: rawInput.classSessionId.toLowerCase(),
    idempotencyKey: rawInput.idempotencyKey,
    expected: {
      name: rawInput.expected.name,
      startsAt: new Date(rawInput.expected.startsAt).toISOString(),
      endsAt: new Date(rawInput.expected.endsAt).toISOString(),
      sessionFormat: rawInput.expected.sessionFormat,
      capacity: rawInput.expected.capacity,
      status: rawInput.expected.status,
      ...(rawInput.expected.recordingKey !== undefined
        ? { recordingKey: rawInput.expected.recordingKey }
        : {}),
    },
    target: {
      name: rawInput.target.name.trim(),
      startsAt: new Date(rawInput.target.startsAt).toISOString(),
      endsAt: new Date(rawInput.target.endsAt).toISOString(),
      sessionFormat: rawInput.target.sessionFormat,
      capacity: rawInput.target.capacity,
    },
  };
  return runBookingOperation({
    command,
    prefix: 'edit-session',
    kind: 'EDIT',
    client,
    decodeSuccess: (value) =>
      isRecord(value) &&
      value.success === true &&
      typeof value.duplicate === 'boolean' &&
      value.classSessionId === command.classSessionId
        ? {
            success: true,
            duplicate: value.duplicate,
            classSessionId: command.classSessionId,
          }
        : null,
    execute: async (input, businessClient) => {
      const current = await readSession(businessClient, input.classSessionId);
      if (!same(current, input.expected))
        return failBookingOperation('SESSION_SNAPSHOT_CONFLICT');
      const executionTime = Math.max(now.getTime(), Date.now());
      if (
        Date.parse(String(current.startsAt)) <= executionTime ||
        Date.parse(input.target.startsAt) <= executionTime
      )
        return failBookingOperation('SESSION_ALREADY_STARTED');
      const bookings = rows(
        await businessClient.query({
          studioBookings: {
            __args: {
              filter: { classSessionId: { eq: input.classSessionId } },
              first: 1000,
            },
            edges: {
              node: {
                id: true,
                status: true,
                classSession: { id: true },
                membership: { id: true, activatedAt: true, expiresOn: true },
              },
            },
            pageInfo: { hasNextPage: true },
          },
        } as never),
        'studioBookings',
      );
      const seen = new Set<string>();
      for (const booking of bookings) {
        if (
          typeof booking.id !== 'string' ||
          seen.has(booking.id) ||
          !isRecord(booking.classSession) ||
          booking.classSession.id !== input.classSessionId ||
          ![
            'BOOKED',
            'ATTENDED',
            'CANCELLED_EARLY',
            'CANCELLED_LATE',
            'CANCELLED_BY_STUDIO',
            'NO_SHOW',
          ].includes(String(booking.status))
        )
          throw Error('Invalid booking inventory');
        seen.add(booking.id);
      }
      const active = bookings.filter(
        (booking) =>
          booking.status === 'BOOKED' || booking.status === 'ATTENDED',
      );
      if (
        bookings.some(
          (booking) =>
            booking.status === 'ATTENDED' || booking.status === 'NO_SHOW',
        ) ||
        input.target.capacity < active.length ||
        (active.length > 0 &&
          (input.target.sessionFormat !== input.expected.sessionFormat ||
            Date.parse(input.target.endsAt) -
              Date.parse(input.target.startsAt) !==
              Date.parse(input.expected.endsAt) -
                Date.parse(input.expected.startsAt)))
      )
        return failBookingOperation('SESSION_BOOKINGS_INCOMPATIBLE');
      for (const booking of active) {
        if (booking.membership === null) continue;
        if (
          !isRecord(booking.membership) ||
          typeof booking.membership.activatedAt !== 'string' ||
          !Number.isFinite(Date.parse(booking.membership.activatedAt)) ||
          Date.parse(booking.membership.activatedAt) >
            Date.parse(input.target.startsAt) ||
          (booking.membership.expiresOn !== null &&
            (typeof booking.membership.expiresOn !== 'string' ||
              !/^\d{4}-\d{2}-\d{2}$/.test(booking.membership.expiresOn) ||
              studioDate(new Date(input.target.startsAt)) >
                booking.membership.expiresOn))
        )
          return failBookingOperation('SESSION_MEMBERSHIP_DATE_CONFLICT');
      }
      const updated: unknown = await businessClient.mutation({
        updateClassSessions: {
          __args: {
            filter: {
              and: [
                { id: { eq: input.classSessionId } },
                { mutationLock: { eq: current.mutationLock } },
                ...Object.entries(input.expected).map(([field, value]) => ({
                  [field]: { eq: value },
                })),
                { startsAt: { gt: new Date().toISOString() } },
              ],
            },
            data: input.target,
          },
          ...fields,
        },
      } as never);
      if (
        !isRecord(updated) ||
        updated.errors !== undefined ||
        !Array.isArray(updated.updateClassSessions) ||
        updated.updateClassSessions.length !== 1
      )
        throw Error('Schedule update unconfirmed');
      const confirmed = await readSession(businessClient, input.classSessionId);
      if (
        !same(confirmed, { ...input.target, status: input.expected.status }) ||
        confirmed.mutationLock !== current.mutationLock
      )
        throw Error('Schedule readback mismatch');
      const hash = createHash('sha256')
        .update(
          JSON.stringify([
            'studio-session-update',
            input.classSessionId,
            input.idempotencyKey,
          ]),
        )
        .digest('hex');
      const eventId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
      const details = JSON.stringify({
        expected: input.expected,
        target: input.target,
      });
      await businessClient.mutation({
        createStudioEvent: {
          __args: {
            data: {
              id: eventId,
              name: 'Изменение расписания тренировки',
              eventType: 'SESSION_UPDATED',
              outcome: 'SUCCESS',
              classSessionId: input.classSessionId,
              idempotencyKey: input.idempotencyKey,
              occurredAt: new Date().toISOString(),
              details,
            },
          },
          id: true,
        },
      } as never);
      const events = rows(
        await businessClient.query({
          studioEvents: {
            __args: { filter: { id: { eq: eventId } }, first: 2 },
            edges: {
              node: {
                id: true,
                classSessionId: true,
                idempotencyKey: true,
                eventType: true,
                outcome: true,
                details: true,
              },
            },
            pageInfo: { hasNextPage: true },
          },
        } as never),
        'studioEvents',
      );
      if (
        events.length !== 1 ||
        events[0].id !== eventId ||
        events[0].classSessionId !== input.classSessionId ||
        events[0].idempotencyKey !== input.idempotencyKey ||
        events[0].eventType !== 'SESSION_UPDATED' ||
        events[0].outcome !== 'SUCCESS' ||
        events[0].details !== details
      )
        throw Error('Schedule audit unconfirmed');
      return {
        success: true,
        duplicate: false,
        classSessionId: input.classSessionId,
      };
    },
  });
};
