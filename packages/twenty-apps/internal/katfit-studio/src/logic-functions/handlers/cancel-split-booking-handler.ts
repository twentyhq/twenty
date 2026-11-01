import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  type CancelSplitBookingInput,
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
type Booking = { id: string; status: string; cancelledAt: string | null };

export type CancelSplitBookingResult =
  | {
      success: true;
      duplicate: boolean;
      status: 'CANCELLED_IN_TIME' | 'LATE_CANCEL' | 'CANCELLED_BY_STUDIO';
      visitsAvailable: number;
    }
  | { success: false; status: number; code: string; message: string };

const fail = (
  status: number,
  code: string,
  message: string,
): CancelSplitBookingResult => ({ success: false, status, code, message });

export const cancelSplitBooking = async (
  rawInput: CancelSplitBookingInput,
  client = new CoreApiClient(),
): Promise<CancelSplitBookingResult> => {
  const input = {
    pairId: String(rawInput.pairId ?? '').trim(),
    membershipId: String(rawInput.membershipId ?? '').trim(),
    classSessionId: String(rawInput.classSessionId ?? '').trim(),
    cancelledAt: String(rawInput.cancelledAt ?? '').trim(),
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
    cancelledByStudio: rawInput.cancelledByStudio === true,
  };
  const cancellationTransactionKey = input.cancelledByStudio
    ? `split-studio-cancel:${input.idempotencyKey}`
    : `split-cancel:${input.idempotencyKey}`;
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
      edges: { node: { id: true, status: true, cancelledAt: true } },
    },
    membershipTransactions: {
      __args: {
        filter: { idempotencyKey: { eq: cancellationTransactionKey } },
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
    return fail(404, 'MEMBERSHIP_NOT_FOUND', 'Общий блок пары не найден.');
  if (!session) return fail(404, 'SESSION_NOT_FOUND', 'Слот не найден.');
  if (bookings.length !== 2)
    return fail(
      409,
      'SPLIT_BOOKINGS_NOT_FOUND',
      'Для отмены нужны две записи пары.',
    );
  if (result.membershipTransactions?.edges?.[0])
    return {
      success: true,
      duplicate: true,
      status: bookings[0].status as
        | 'CANCELLED_IN_TIME'
        | 'LATE_CANCEL'
        | 'CANCELLED_BY_STUDIO',
      visitsAvailable: membership.visitsAvailable,
    };
  const previousBookingsResult = (await client.query({
    studioBookings: {
      __args: {
        filter: {
          and: [
            { pairId: { eq: input.pairId } },
            { status: { eq: 'CANCELLED_IN_TIME' } },
          ],
        },
        first: 1000,
      },
      edges: { node: { id: true, cancelledAt: true } },
    },
  } as never)) as unknown as {
    studioBookings?: {
      edges?: Array<{ node: Pick<Booking, 'id' | 'cancelledAt'> }>;
    };
  };
  const previousTimely =
    previousBookingsResult.studioBookings?.edges
      ?.map(({ node }) => node.cancelledAt)
      .filter((cancelledAt): cancelledAt is string => cancelledAt !== null)
      .sort((left, right) => right.localeCompare(left))[0] ?? null;
  const outcome = input.cancelledByStudio
    ? {
        success: true as const,
        status: 'CANCELLED_BY_STUDIO' as const,
        consumesVisit: false,
      }
    : evaluateSplitCancellation(
        session.startsAt,
        input.cancelledAt,
        previousTimely,
      );
  if (!outcome.success) return { ...outcome, status: 409 };
  if (membership.visitsReserved < 1)
    return fail(
      409,
      'RESERVATION_NOT_FOUND',
      'У записи пары нет резерва общего блока.',
    );
  for (const booking of bookings)
    await client.mutation({
      updateStudioBooking: {
        __args: {
          id: booking.id,
          data: {
            status: outcome.status,
            cancelledAt: new Date(input.cancelledAt).toISOString(),
            consumesVisit: outcome.consumesVisit,
          },
        },
        id: true,
      },
    } as never);
  const occurredAt = new Date(input.cancelledAt).toISOString();
  await client.mutation({
    createMembershipTransaction: {
      __args: {
        data: {
          name: 'Освобождение резерва · отмена сплита',
          transactionType: 'RELEASE',
          visitDelta: 1,
          daysDelta: 0,
          occurredAt,
          idempotencyKey: cancellationTransactionKey,
          reason: input.cancelledByStudio
            ? 'Отмена занятия студией'
            : 'Отмена слота пары',
          membershipId: membership.id,
        },
      },
      id: true,
    },
  } as never);
  if (!input.cancelledByStudio && outcome.consumesVisit)
    await client.mutation({
      createMembershipTransaction: {
        __args: {
          data: {
            name: 'Списание · поздняя отмена сплита',
            transactionType: 'CONSUME',
            visitDelta: -1,
            daysDelta: 0,
            occurredAt,
            idempotencyKey: `split-cancel-consume:${input.idempotencyKey}`,
            reason: 'Поздняя отмена пары',
            membershipId: membership.id,
            bookingId: bookings[0].id,
          },
        },
        id: true,
      },
    } as never);
  const visitsAvailable = outcome.consumesVisit
    ? membership.visitsAvailable
    : membership.visitsAvailable + 1;
  await client.mutation({
    updateStudioMembership: {
      __args: {
        id: membership.id,
        data: {
          visitsReserved: membership.visitsReserved - 1,
          visitsConsumed: outcome.consumesVisit
            ? membership.visitsConsumed + 1
            : membership.visitsConsumed,
          visitsAvailable,
        },
      },
      id: true,
    },
  } as never);
  return {
    success: true,
    duplicate: false,
    status: outcome.status,
    visitsAvailable,
  };
};
