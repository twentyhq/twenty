import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  calculateLedgerBalance,
  type LedgerEntry,
} from 'src/logic-functions/utils/past-attendance';

export const readBookingMembershipBalance = async (
  client: CoreApiClient,
  membershipId: string,
) => {
  const result = (await client.query({
    membershipTransactions: {
      __args: { filter: { membershipId: { eq: membershipId } }, first: 1000 },
      edges: {
        node: {
          id: true,
          transactionType: true,
          visitDelta: true,
          occurredAt: true,
        },
      },
    },
  } as never)) as unknown as {
    membershipTransactions?: { edges?: Array<{ node: LedgerEntry }> };
  };
  const ledger =
    result.membershipTransactions?.edges?.map(({ node }) => node) ?? [];
  const balance = calculateLedgerBalance(ledger);

  if (
    ledger.length === 1000 ||
    !ledger.some((entry) => entry.transactionType === 'GRANT') ||
    !balance.success ||
    balance.reserved < 0
  ) {
    throw new Error('Журнал пакета требует проверки владельцем.');
  }

  return balance;
};

export const synchronizeBookingMembership = async (
  client: CoreApiClient,
  membershipId: string,
): Promise<number> => {
  const balance = await readBookingMembershipBalance(client, membershipId);
  await client.mutation({
    updateStudioMembership: {
      __args: {
        id: membershipId,
        data: {
          visitsGranted: balance.granted,
          visitsAvailable: balance.available,
          visitsReserved: balance.reserved,
          visitsConsumed: balance.consumed,
        },
      },
      id: true,
    },
  } as never);

  return balance.available;
};

export const synchronizeSessionBookedCount = async (
  client: CoreApiClient,
  classSessionId: string,
): Promise<void> => {
  const result = (await client.query({
    studioBookings: {
      __args: {
        filter: { classSessionId: { eq: classSessionId } },
        first: 1000,
      },
      edges: { node: { id: true, status: true } },
    },
  } as never)) as unknown as {
    studioBookings?: {
      edges?: Array<{ node: { id: string; status: string } }>;
    };
  };
  const bookings = result.studioBookings?.edges?.map(({ node }) => node) ?? [];

  if (bookings.length === 1000) {
    throw new Error(
      'Слишком много записей для безопасного пересчёта вместимости.',
    );
  }

  await client.mutation({
    updateClassSession: {
      __args: {
        id: classSessionId,
        data: {
          bookedCount: bookings.filter(({ status }) =>
            ['BOOKED', 'ATTENDED'].includes(status),
          ).length,
        },
      },
      id: true,
    },
  } as never);
};
