import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  calculateLedgerBalance,
  type LedgerEntry,
} from 'src/logic-functions/utils/past-attendance';
import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';

type CancelRegularBookingInput = {
  bookingId: string;
  cancelledAt: string;
  idempotencyKey: string;
};

type Booking = {
  id: string;
  membership: { id: string } | null;
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
    return fail(400, 'INVALID_INPUT', 'Запись, дата отмены и ключ операции обязательны.');
  }

  const releaseKey = `regular-release:${input.idempotencyKey}`;
  const result = (await client.query({
    studioBookings: {
      __args: { filter: { id: { eq: input.bookingId } }, first: 1 },
      edges: { node: { id: true, membership: { id: true }, status: true } },
    },
    membershipTransactions: {
      __args: { filter: { idempotencyKey: { eq: releaseKey } }, first: 1 },
      edges: { node: { id: true } },
    },
  } as never)) as unknown as {
    membershipTransactions?: { edges?: Array<{ node: { id: string } }> };
    studioBookings?: { edges?: Array<{ node: Booking }> };
  };
  const booking = result.studioBookings?.edges?.[0]?.node;
  const membershipId = booking?.membership?.id;
  if (booking === undefined || membershipId === undefined) {
    return fail(404, 'BOOKING_NOT_FOUND', 'Запись клиента не найдена.');
  }
  if (!['BOOKED', 'CONFIRMED', 'CANCELLED_BY_STUDIO'].includes(booking.status)) {
    return fail(409, 'BOOKING_NOT_CANCELLABLE', 'Эту запись нельзя освободить.');
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
  if (membership === undefined) return fail(404, 'MEMBERSHIP_NOT_FOUND', 'Пакет клиента не найден.');
  const occurredAt = new Date(input.cancelledAt).toISOString();

  let hasRelease = result.membershipTransactions?.edges?.[0] !== undefined;
  if (!hasRelease) {
    try {
      await client.mutation({
        createMembershipTransaction: {
          __args: {
            data: {
              daysDelta: 0,
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
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('duplicate entry')) {
        throw error;
      }

      hasRelease = true;
    }
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
  const ledger = ledgerResult.membershipTransactions?.edges?.map(({ node }) => node) ?? [];
  if (ledger.length === 1000) {
    return fail(409, 'LEDGER_TOO_LARGE', 'Журнал пакета слишком велик для безопасной сверки.');
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
  if (!balance.success) {
    return fail(409, 'LEDGER_MISMATCH', 'Журнал пакета требует проверки владельцем.');
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

  await recordStudioEvent({ bookingId: booking.id, eventType: 'BOOKING_CANCELLED', idempotencyKey: input.idempotencyKey, membershipId: membership.id, outcome: 'SUCCESS' }, client);

  return {
    success: true,
    duplicate: hasRelease || booking.status === 'CANCELLED_BY_STUDIO',
    visitsAvailable: balance.available,
  };
};
