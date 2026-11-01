import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  type CancelSplitParticipantInput,
  evaluateSplitCancellation,
} from 'src/logic-functions/utils/split-cancellation';

type RelatedRecord = { id: string } | null;
type Membership = {
  id: string;
  visitsAvailable: number;
  visitsReserved: number;
  visitsConsumed: number;
  pair: RelatedRecord;
};
type Session = { id: string; startsAt: string };
type Booking = { id: string; status: string; person: RelatedRecord };

export type CancelSplitParticipantResult =
  | { success: true; duplicate: boolean; visitsAvailable: number }
  | { success: false; status: number; code: string; message: string };

const failure = (
  status: number,
  code: string,
  message: string,
): CancelSplitParticipantResult => ({ success: false, status, code, message });

export const cancelSplitParticipant = async (
  rawInput: CancelSplitParticipantInput,
  client = new CoreApiClient(),
): Promise<CancelSplitParticipantResult> => {
  const input = {
    pairId: String(rawInput.pairId ?? '').trim(),
    membershipId: String(rawInput.membershipId ?? '').trim(),
    classSessionId: String(rawInput.classSessionId ?? '').trim(),
    personId: String(rawInput.personId ?? '').trim(),
    cancelledAt: String(rawInput.cancelledAt ?? '').trim(),
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
  };
  const result = (await client.query({
    studioMemberships: {
      __args: { filter: { id: { eq: input.membershipId } }, first: 1 },
      edges: {
        node: {
          id: true,
          visitsAvailable: true,
          visitsReserved: true,
          visitsConsumed: true,
          pair: { id: true },
        },
      },
    },
    classSessions: {
      __args: { filter: { id: { eq: input.classSessionId } }, first: 1 },
      edges: { node: { id: true, startsAt: true } },
    },
    studioBookings: {
      __args: {
        filter: {
          and: [
            { pairId: { eq: input.pairId } },
            { membershipId: { eq: input.membershipId } },
            { classSessionId: { eq: input.classSessionId } },
          ],
        },
        first: 3,
      },
      edges: { node: { id: true, status: true, person: { id: true } } },
    },
    membershipTransactions: {
      __args: {
        filter: {
          idempotencyKey: {
            eq: `split-participant-cancel:${input.idempotencyKey}`,
          },
        },
        first: 1,
      },
      edges: { node: { id: true } },
    },
  } as never)) as unknown as {
    studioMemberships?: { edges?: Array<{ node: Membership }> };
    classSessions?: { edges?: Array<{ node: Session }> };
    studioBookings?: { edges?: Array<{ node: Booking }> };
    membershipTransactions?: { edges?: Array<{ node: { id: string } }> };
  };
  const membership = result.studioMemberships?.edges?.[0]?.node;
  const session = result.classSessions?.edges?.[0]?.node;
  const bookings = result.studioBookings?.edges?.map(({ node }) => node) ?? [];
  if (!membership || membership.pair?.id !== input.pairId)
    return failure(404, 'MEMBERSHIP_NOT_FOUND', 'Общий блок пары не найден.');
  if (!session || bookings.length !== 2)
    return failure(
      409,
      'SPLIT_BOOKINGS_NOT_FOUND',
      'Для пары нет двух записей на этот слот.',
    );
  const cancelledBooking = bookings.find(
    (booking) => booking.person?.id === input.personId,
  );
  const attendingBooking = bookings.find(
    (booking) => booking.person?.id !== input.personId,
  );
  if (!cancelledBooking || !attendingBooking)
    return failure(
      403,
      'PERSON_NOT_IN_PAIR',
      'Клиент не является участником этой записи пары.',
    );
  if (result.membershipTransactions?.edges?.[0])
    return {
      success: true,
      duplicate: true,
      visitsAvailable: membership.visitsAvailable,
    };
  const outcome = evaluateSplitCancellation(
    session.startsAt,
    input.cancelledAt,
    null,
  );
  if (!outcome.success) return { ...outcome, status: 409 };
  if (!outcome.consumesVisit)
    return failure(
      409,
      'TIMELY_CANCELLATION_REQUIRES_PAIR',
      'Своевременная отмена переносит слот целиком и оформляется для пары.',
    );
  if (membership.visitsReserved < 1)
    return failure(
      409,
      'RESERVATION_NOT_FOUND',
      'У записи пары нет резерва общего блока.',
    );
  const occurredAt = new Date(input.cancelledAt).toISOString();
  await client.mutation({
    updateStudioBooking: {
      __args: {
        id: cancelledBooking.id,
        data: {
          status: 'LATE_CANCEL',
          cancelledAt: occurredAt,
          consumesVisit: true,
        },
      },
      id: true,
    },
  } as never);
  await client.mutation({
    createMembershipTransaction: {
      __args: {
        data: {
          name: 'Освобождение резерва · поздняя отмена участника',
          transactionType: 'RELEASE',
          visitDelta: 1,
          daysDelta: 0,
          occurredAt,
          idempotencyKey: `split-participant-release:${input.idempotencyKey}`,
          reason: 'Второй участник может посетить исходный слот',
          membershipId: membership.id,
        },
      },
      id: true,
    },
  } as never);
  await client.mutation({
    createMembershipTransaction: {
      __args: {
        data: {
          name: 'Списание · поздняя отмена участника',
          transactionType: 'CONSUME',
          visitDelta: -1,
          daysDelta: 0,
          occurredAt,
          idempotencyKey: `split-participant-cancel:${input.idempotencyKey}`,
          reason: 'Одна совместная тренировка пары',
          membershipId: membership.id,
          bookingId: cancelledBooking.id,
        },
      },
      id: true,
    },
  } as never);
  await client.mutation({
    updateStudioMembership: {
      __args: {
        id: membership.id,
        data: {
          visitsReserved: membership.visitsReserved - 1,
          visitsConsumed: membership.visitsConsumed + 1,
        },
      },
      id: true,
    },
  } as never);
  return {
    success: true,
    duplicate: false,
    visitsAvailable: membership.visitsAvailable,
  };
};
