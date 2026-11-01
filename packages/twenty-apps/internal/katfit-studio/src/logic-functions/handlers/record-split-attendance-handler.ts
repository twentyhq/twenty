import { CoreApiClient } from 'twenty-client-sdk/core';

import { type RecordSplitAttendanceInput, validateSplitAttendance } from 'src/logic-functions/utils/split-attendance';

type RelatedRecord = { id: string } | null;
type Membership = { id: string; visitsAvailable: number; visitsReserved: number; visitsConsumed: number; pair: RelatedRecord };
type Session = { id: string; startsAt: string; endsAt: string; status: string; attendedCount: number };
type Booking = { id: string; status: string; pair: RelatedRecord; membership: RelatedRecord; classSession: RelatedRecord };

export type RecordSplitAttendanceResult =
  | { success: true; duplicate: boolean; bookingIds: string[]; visitsAvailable: number }
  | { success: false; status: number; code: string; message: string };

const fail = (status: number, code: string, message: string): RecordSplitAttendanceResult => ({ success: false, status, code, message });

export const recordSplitAttendance = async (rawInput: RecordSplitAttendanceInput, client = new CoreApiClient()): Promise<RecordSplitAttendanceResult> => {
  const input = { pairId: String(rawInput.pairId ?? '').trim(), membershipId: String(rawInput.membershipId ?? '').trim(), classSessionId: String(rawInput.classSessionId ?? '').trim(), idempotencyKey: String(rawInput.idempotencyKey ?? '').trim() };
  const result = (await client.query({
    studioMemberships: { __args: { filter: { id: { eq: input.membershipId } }, first: 1 }, edges: { node: { id: true, visitsAvailable: true, visitsReserved: true, visitsConsumed: true, pair: { id: true } } } },
    classSessions: { __args: { filter: { id: { eq: input.classSessionId } }, first: 1 }, edges: { node: { id: true, startsAt: true, endsAt: true, status: true, attendedCount: true } } },
    studioBookings: { __args: { filter: { and: [{ pairId: { eq: input.pairId } }, { membershipId: { eq: input.membershipId } }, { classSessionId: { eq: input.classSessionId } }] }, first: 3 }, edges: { node: { id: true, status: true, pair: { id: true }, membership: { id: true }, classSession: { id: true } } } },
    membershipTransactions: { __args: { filter: { idempotencyKey: { eq: `split-consume:${input.idempotencyKey}` } }, first: 1 }, edges: { node: { id: true } } },
  } as never)) as unknown as { studioMemberships?: { edges?: Array<{ node: Membership }> }; classSessions?: { edges?: Array<{ node: Session }> }; studioBookings?: { edges?: Array<{ node: Booking }> }; membershipTransactions?: { edges?: Array<{ node: { id: string } }> } };
  const membership = result.studioMemberships?.edges?.[0]?.node;
  const session = result.classSessions?.edges?.[0]?.node;
  const bookings = result.studioBookings?.edges?.map(({ node }) => node) ?? [];
  if (!membership || membership.pair?.id !== input.pairId) return fail(404, 'MEMBERSHIP_NOT_FOUND', 'Общий блок пары не найден.');
  if (!session) return fail(404, 'SESSION_NOT_FOUND', 'Слот не найден.');
  const validation = validateSplitAttendance(input, session.startsAt, session.endsAt);
  if (!validation.success) return { ...validation, status: 409 };
  if (bookings.length !== 2) return fail(409, 'SPLIT_BOOKINGS_NOT_FOUND', 'Для проведения нужны две записи пары на этот слот.');
  if (result.membershipTransactions?.edges?.[0]) return { success: true, duplicate: true, bookingIds: bookings.map(({ id }) => id), visitsAvailable: membership.visitsAvailable };
  if (!['PLANNED', 'CONFIRMED'].includes(session.status) || bookings.some((booking) => booking.status !== 'BOOKED')) return fail(409, 'ATTENDANCE_STATE_CONFLICT', 'Занятие или записи пары уже изменены.');
  if (membership.visitsReserved < 1) return fail(409, 'RESERVATION_NOT_FOUND', 'У записи пары нет резерва общего блока.');
  for (const booking of bookings) await client.mutation({ updateStudioBooking: { __args: { id: booking.id, data: { status: 'ATTENDED', consumesVisit: true, recordedAt: new Date().toISOString() } }, id: true } } as never);
  const occurredAt = new Date().toISOString();
  await client.mutation({ createMembershipTransaction: { __args: { data: { name: 'Освобождение резерва · сплит', transactionType: 'RELEASE', visitDelta: 1, daysDelta: 0, occurredAt, idempotencyKey: `split-release:${input.idempotencyKey}`, reason: 'Пара посетила забронированный слот', membershipId: membership.id } }, id: true } } as never);
  await client.mutation({ createMembershipTransaction: { __args: { data: { name: 'Списание · сплит', transactionType: 'CONSUME', visitDelta: -1, daysDelta: 0, occurredAt, idempotencyKey: `split-consume:${input.idempotencyKey}`, reason: 'Одна совместная тренировка пары', membershipId: membership.id, bookingId: bookings[0].id } }, id: true } } as never);
  const visitsAvailable = membership.visitsAvailable;
  await client.mutation({ updateStudioMembership: { __args: { id: membership.id, data: { visitsReserved: membership.visitsReserved - 1, visitsConsumed: membership.visitsConsumed + 1, visitsAvailable } }, id: true } } as never);
  await client.mutation({ updateClassSession: { __args: { id: session.id, data: { status: 'COMPLETED', attendedCount: session.attendedCount + 2 } }, id: true } } as never);
  return { success: true, duplicate: false, bookingIds: bookings.map(({ id }) => id), visitsAvailable };
};
