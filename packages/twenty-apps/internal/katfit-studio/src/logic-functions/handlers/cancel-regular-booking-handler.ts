import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  calculateLedgerBalance,
  type LedgerEntry,
} from 'src/logic-functions/utils/past-attendance';
import { recordBookingEvent } from 'src/logic-functions/utils/booking-event';
import { synchronizeSessionBookedCount } from 'src/logic-functions/utils/booking-ledger';

type CancelRegularBookingInput = {
  bookingId: string;
  cancelledAt: string;
  idempotencyKey: string;
};

type Booking = {
  id: string;
  bookingType: string;
  membership: { id: string } | null;
  classSession: { id: string } | null;
  bookedAt: string;
  status: string;
};

type Membership = {
  id: string;
  visitsAvailable: number;
  visitsGranted: number;
  visitsReserved: number;
};

type MembershipTransaction = LedgerEntry;

export type CancelRegularBookingResult =
  | { success: true; duplicate: boolean; visitsAvailable: number }
  | { success: false; code: string; message: string; status: number };

const fail = (
  status: number,
  code: string,
  message: string,
): CancelRegularBookingResult => ({ success: false, status, code, message });

export const cancelRegularBooking = async (
  rawInput: CancelRegularBookingInput,
  client = new CoreApiClient(),
): Promise<CancelRegularBookingResult> => {
  const input = {
    bookingId: String(rawInput.bookingId ?? '').trim(),
    cancelledAt: String(rawInput.cancelledAt ?? '').trim(),
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
  };
  if (Object.values(input).some((value) => value === '')) {
    return fail(
      400,
      'INVALID_INPUT',
      'Запись, дата отмены и ключ операции обязательны.',
    );
  }
  const cancellationDate = new Date(input.cancelledAt);
  if (
    Number.isNaN(cancellationDate.getTime()) ||
    cancellationDate > new Date()
  ) {
    return fail(
      400,
      'INVALID_CANCELLATION_DATE',
      'Укажите корректную дату отмены не в будущем.',
    );
  }

  const releaseKey = `regular-release:${input.idempotencyKey}`;
  const result = (await client.query({
    studioBookings: {
      __args: { filter: { id: { eq: input.bookingId } }, first: 1 },
      edges: {
        node: {
          id: true,
          bookingType: true,
          membership: { id: true },
          classSession: { id: true },
          bookedAt: true,
          status: true,
        },
      },
    },
    membershipTransactions: {
      __args: {
        filter: {
          or: [
            { idempotencyKey: { eq: releaseKey } },
            {
              bookingId: { eq: input.bookingId },
              transactionType: { eq: 'RELEASE' },
            },
          ],
        },
        first: 2,
      },
      edges: {
        node: {
          id: true,
          booking: { id: true },
          membership: { id: true },
          occurredAt: true,
          transactionType: true,
          visitDelta: true,
        },
      },
    },
  } as never)) as unknown as {
    membershipTransactions?: {
      edges?: Array<{
        node: {
          id: string;
          booking: { id: string } | null;
          membership: { id: string } | null;
          occurredAt: string;
          transactionType: string;
          visitDelta: number;
        };
      }>;
    };
    studioBookings?: { edges?: Array<{ node: Booking }> };
  };
  const booking = result.studioBookings?.edges?.[0]?.node;
  const membershipId = booking?.membership?.id;
  const classSessionId = booking?.classSession?.id;
  if (
    booking === undefined ||
    membershipId === undefined ||
    classSessionId === undefined
  ) {
    return fail(404, 'BOOKING_NOT_FOUND', 'Запись клиента не найдена.');
  }
  const releases = result.membershipTransactions?.edges ?? [];
  if (!['REGULAR', 'PERSONAL'].includes(booking.bookingType)) {
    return fail(
      409,
      'BOOKING_TYPE_NOT_SUPPORTED',
      'Сплит и разовые записи отменяются отдельными командами.',
    );
  }
  if (
    releases.length > 1 ||
    releases.some(
      ({ node }) =>
        node.booking?.id !== booking.id ||
        node.membership?.id !== membershipId ||
        node.transactionType !== 'RELEASE' ||
        node.visitDelta !== 1,
    )
  ) {
    return fail(
      409,
      'IDEMPOTENCY_CONFLICT',
      'Освобождение резерва связано с другими данными или требует проверки владельцем.',
    );
  }
  const existingRelease = releases[0]?.node;
  if (
    booking.status === 'CANCELLED_BY_STUDIO' &&
    existingRelease === undefined
  ) {
    return fail(
      409,
      'CANCELLATION_REQUIRES_REVIEW',
      'У отменённой записи не найдено связанное освобождение резерва.',
    );
  }
  if (
    existingRelease === undefined &&
    cancellationDate < new Date(booking.bookedAt)
  ) {
    return fail(
      400,
      'INVALID_CANCELLATION_DATE',
      'Отмена не может предшествовать записи.',
    );
  }
  if (
    !['BOOKED', 'CONFIRMED', 'CANCELLED_BY_STUDIO'].includes(booking.status)
  ) {
    return fail(
      409,
      'BOOKING_NOT_CANCELLABLE',
      'Эту запись нельзя освободить.',
    );
  }

  const membershipResult = (await client.query({
    studioMemberships: {
      __args: { filter: { id: { eq: membershipId } }, first: 1 },
      edges: {
        node: {
          id: true,
          visitsAvailable: true,
          visitsGranted: true,
          visitsReserved: true,
        },
      },
    },
  } as never)) as unknown as {
    studioMemberships?: { edges?: Array<{ node: Membership }> };
  };
  const membership = membershipResult.studioMemberships?.edges?.[0]?.node;
  if (membership === undefined)
    return fail(404, 'MEMBERSHIP_NOT_FOUND', 'Пакет клиента не найден.');
  const occurredAt =
    existingRelease?.occurredAt ?? cancellationDate.toISOString();

  const hasRelease = existingRelease !== undefined;
  if (!hasRelease) {
    const reservationResult = (await client.query({
      membershipTransactions: {
        __args: {
          filter: {
            bookingId: { eq: booking.id },
            transactionType: { eq: 'RESERVE' },
          },
          first: 2,
        },
        edges: {
          node: { id: true, membership: { id: true }, visitDelta: true },
        },
      },
    } as never)) as unknown as {
      membershipTransactions?: {
        edges?: Array<{
          node: { membership: { id: string } | null; visitDelta: number };
        }>;
      };
    };
    const reservations = reservationResult.membershipTransactions?.edges ?? [];
    if (
      reservations.length !== 1 ||
      reservations[0].node.membership?.id !== membershipId ||
      reservations[0].node.visitDelta !== -1
    ) {
      return fail(
        409,
        'RESERVATION_NOT_FOUND',
        'У записи нет единственного подтверждённого резерва.',
      );
    }
    await client.mutation({
      createMembershipTransaction: {
        __args: {
          data: {
            daysDelta: 0,
            bookingId: booking.id,
            idempotencyKey: releaseKey,
            membershipId: membership.id,
            name: 'Освобождение резерва · отмена занятия',
            occurredAt,
            reason: 'Отмена занятия студией',
            transactionType: 'RELEASE',
            visitDelta: 1,
          },
        },
        id: true,
      },
    } as never);
  }

  const ledgerResult = (await client.query({
    membershipTransactions: {
      __args: { filter: { membershipId: { eq: membership.id } }, first: 1000 },
      edges: {
        node: {
          id: true,
          occurredAt: true,
          transactionType: true,
          visitDelta: true,
        },
      },
    },
  } as never)) as unknown as {
    membershipTransactions?: { edges?: Array<{ node: MembershipTransaction }> };
  };
  const ledger =
    ledgerResult.membershipTransactions?.edges?.map(({ node }) => node) ?? [];
  if (ledger.length === 1000) {
    return fail(
      409,
      'LEDGER_TOO_LARGE',
      'Журнал пакета слишком велик для безопасной сверки.',
    );
  }

  const hasGrant = ledger.some((entry) => entry.transactionType === 'GRANT');
  const balance = calculateLedgerBalance(
    hasGrant
      ? ledger
      : [
          {
            id: `opening-balance:${membership.id}`,
            occurredAt: '1970-01-01T00:00:00.000Z',
            transactionType: 'GRANT',
            visitDelta: membership.visitsGranted,
          },
          ...ledger,
        ],
  );
  if (!balance.success || balance.reserved < 0) {
    return fail(
      409,
      'LEDGER_MISMATCH',
      'Журнал пакета требует проверки владельцем.',
    );
  }

  await client.mutation({
    updateStudioMembership: {
      __args: {
        id: membership.id,
        data: {
          visitsAvailable: balance.available,
          visitsReserved: balance.reserved,
        },
      },
      id: true,
    },
  } as never);
  await client.mutation({
    updateStudioBooking: {
      __args: {
        id: booking.id,
        data: {
          cancelledAt: occurredAt,
          consumesVisit: false,
          status: 'CANCELLED_BY_STUDIO',
        },
      },
      id: true,
    },
  } as never);

  await synchronizeSessionBookedCount(client, classSessionId);
  await recordBookingEvent(
    {
      bookingId: booking.id,
      classSessionId,
      eventType: 'BOOKING_CANCELLED',
      idempotencyKey: input.idempotencyKey,
      membershipId: membership.id,
    },
    client,
  );

  return {
    success: true,
    duplicate: hasRelease || booking.status === 'CANCELLED_BY_STUDIO',
    visitsAvailable: balance.available,
  };
};
