import { CoreApiClient } from 'twenty-client-sdk/core';

import { recordBookingEvent } from 'src/logic-functions/utils/booking-event';
import {
  readBookingMembershipBalance,
  synchronizeBookingMembership,
  synchronizeSessionBookedCount,
} from 'src/logic-functions/utils/booking-ledger';

type RelatedRecord = { id: string } | null;

type RegularBookingInput = {
  classSessionId: string;
  idempotencyKey: string;
  membershipId: string;
  personId: string;
};

type Membership = {
  id: string;
  activatedAt: string | null;
  expiresOn: string | null;
  product: { id: string; category: string; sessionFormat: string } | null;
  person: RelatedRecord;
  status: string;
  visitsAvailable: number;
  visitsReserved: number;
};

type Session = {
  bookedCount: number;
  capacity: number;
  id: string;
  sessionFormat: string;
  startsAt: string;
  status: string;
};

export type CreateRegularBookingResult =
  | { success: true; bookingId: string; duplicate: boolean }
  | { success: false; code: string; message: string; status: number };

const fail = (
  status: number,
  code: string,
  message: string,
): CreateRegularBookingResult => ({ success: false, status, code, message });

export const createRegularBooking = async (
  rawInput: RegularBookingInput,
  client = new CoreApiClient(),
): Promise<CreateRegularBookingResult> => {
  const input = {
    classSessionId: String(rawInput.classSessionId ?? '').trim(),
    idempotencyKey: String(rawInput.idempotencyKey ?? '').trim(),
    membershipId: String(rawInput.membershipId ?? '').trim(),
    personId: String(rawInput.personId ?? '').trim(),
  };

  if (Object.values(input).some((value) => value === '')) {
    return fail(
      400,
      'INVALID_INPUT',
      'Клиент, пакет, слот и ключ операции обязательны.',
    );
  }

  const bookingKey = `regular-booking:${input.idempotencyKey}`;
  const result = (await client.query({
    studioMemberships: {
      __args: { filter: { id: { eq: input.membershipId } }, first: 1 },
      edges: {
        node: {
          id: true,
          activatedAt: true,
          expiresOn: true,
          person: { id: true },
          product: { id: true, category: true, sessionFormat: true },
          status: true,
          visitsAvailable: true,
          visitsReserved: true,
        },
      },
    },
    classSessions: {
      __args: { filter: { id: { eq: input.classSessionId } }, first: 1 },
      edges: {
        node: {
          bookedCount: true,
          capacity: true,
          id: true,
          sessionFormat: true,
          startsAt: true,
          status: true,
        },
      },
    },
    studioBookings: {
      __args: { filter: { externalId: { eq: bookingKey } }, first: 1 },
      edges: {
        node: {
          id: true,
          status: true,
          person: { id: true },
          membership: { id: true },
          classSession: { id: true },
        },
      },
    },
    membershipTransactions: {
      __args: {
        filter: {
          idempotencyKey: { eq: `regular-reserve:${input.idempotencyKey}` },
        },
        first: 1,
      },
      edges: {
        node: { id: true, membership: { id: true }, booking: { id: true } },
      },
    },
  } as never)) as unknown as {
    classSessions?: { edges?: Array<{ node: Session }> };
    studioBookings?: {
      edges?: Array<{
        node: {
          id: string;
          status: string;
          person: RelatedRecord;
          membership: RelatedRecord;
          classSession: RelatedRecord;
        };
      }>;
    };
    membershipTransactions?: {
      edges?: Array<{
        node: { id: string; membership: RelatedRecord; booking: RelatedRecord };
      }>;
    };
    studioMemberships?: { edges?: Array<{ node: Membership }> };
  };

  const existingBooking = result.studioBookings?.edges?.[0]?.node;
  const reservation = result.membershipTransactions?.edges?.[0]?.node;
  if (
    existingBooking !== undefined &&
    (existingBooking.person?.id !== input.personId ||
      existingBooking.membership?.id !== input.membershipId ||
      existingBooking.classSession?.id !== input.classSessionId)
  ) {
    return fail(
      409,
      'IDEMPOTENCY_CONFLICT',
      'Ключ операции уже использован с другими данными.',
    );
  }
  if (
    reservation !== undefined &&
    (reservation.membership?.id !== input.membershipId ||
      reservation.booking?.id !== existingBooking?.id)
  ) {
    return fail(
      409,
      'IDEMPOTENCY_CONFLICT',
      'Ключ резерва уже использован с другими данными.',
    );
  }
  if (existingBooking !== undefined && existingBooking.status !== 'BOOKED') {
    await recordBookingEvent(
      {
        bookingId: existingBooking.id,
        classSessionId: input.classSessionId,
        membershipId: input.membershipId,
        eventType: 'BOOKING_CREATED',
        idempotencyKey: input.idempotencyKey,
      },
      client,
    );
    return { success: true, bookingId: existingBooking.id, duplicate: true };
  }

  const membership = result.studioMemberships?.edges?.[0]?.node;
  const session = result.classSessions?.edges?.[0]?.node;
  if (membership === undefined || membership.person?.id !== input.personId) {
    return fail(404, 'MEMBERSHIP_NOT_FOUND', 'Пакет клиента не найден.');
  }
  if (session === undefined)
    return fail(404, 'SESSION_NOT_FOUND', 'Слот не найден.');
  if (
    !membership.product ||
    !['GROUP_PACKAGE', 'PERSONAL'].includes(membership.product.category)
  ) {
    return fail(
      409,
      'PRODUCT_NOT_SUPPORTED',
      'Для обычной записи нужен групповой или персональный пакет.',
    );
  }
  if (
    existingBooking === undefined &&
    (!membership.activatedAt ||
      !Number.isFinite(new Date(membership.activatedAt).getTime()) ||
      new Date(membership.activatedAt) > new Date(session.startsAt) ||
      (membership.expiresOn &&
        membership.expiresOn < session.startsAt.slice(0, 10)))
  ) {
    return fail(
      409,
      'MEMBERSHIP_NOT_VALID_AT_SESSION',
      'Пакет не покрывает дату тренировки.',
    );
  }
  const participants = (await client.query({
    studioBookings: {
      __args: {
        filter: {
          personId: { eq: input.personId },
          classSessionId: { eq: session.id },
        },
        first: 1000,
      },
      edges: { node: { id: true, status: true } },
    },
  } as never)) as unknown as {
    studioBookings?: {
      edges?: Array<{ node: { id: string; status: string } }>;
    };
  };
  const participantBookings = participants.studioBookings?.edges ?? [];
  if (
    participantBookings.length === 1000 ||
    participantBookings.some(
      ({ node }) =>
        node.id !== existingBooking?.id &&
        ['BOOKED', 'CONFIRMED', 'ATTENDED'].includes(node.status),
    )
  ) {
    return fail(
      409,
      'PARTICIPANT_ALREADY_BOOKED',
      'Клиент уже записан на тренировку или список требует проверки.',
    );
  }
  const balance = await readBookingMembershipBalance(client, membership.id);
  if (
    reservation === undefined &&
    (membership.status !== 'ACTIVE' || balance.available < 1)
  ) {
    return fail(
      409,
      'INSUFFICIENT_BALANCE',
      'У клиента нет доступных посещений.',
    );
  }
  if (
    membership.product === null ||
    membership.product.sessionFormat !== session.sessionFormat
  ) {
    return fail(
      409,
      'PRODUCT_MISMATCH',
      'Пакет не подходит к формату занятия.',
    );
  }
  if (
    existingBooking === undefined &&
    !['PLANNED', 'CONFIRMED'].includes(session.status)
  ) {
    return fail(409, 'SESSION_NOT_BOOKABLE', 'На этот слот нельзя записаться.');
  }
  if (
    existingBooking === undefined &&
    new Date(session.startsAt) <= new Date()
  ) {
    return fail(
      409,
      'SESSION_IN_PAST',
      'Запись возможна только на будущий слот.',
    );
  }
  if (
    existingBooking === undefined &&
    session.bookedCount >= session.capacity
  ) {
    return fail(
      409,
      'INSUFFICIENT_CAPACITY',
      'На занятии больше нет свободных мест.',
    );
  }

  const bookingType =
    membership.product.category === 'PERSONAL' ? 'PERSONAL' : 'REGULAR';
  const booking =
    existingBooking === undefined
      ? ((await client.mutation({
          createStudioBooking: {
            __args: {
              data: {
                bookingType,
                bookedAt: new Date().toISOString(),
                classSessionId: session.id,
                consumesVisit: false,
                externalId: bookingKey,
                membershipId: membership.id,
                name: `Запись · ${session.startsAt.slice(0, 16)}`,
                personId: input.personId,
                productId: membership.product.id,
                status: 'BOOKED',
              },
            },
            id: true,
          },
        } as never)) as unknown as { createStudioBooking: { id: string } })
      : { createStudioBooking: { id: existingBooking.id } };

  if (reservation === undefined)
    await client.mutation({
      createMembershipTransaction: {
        __args: {
          data: {
            bookingId: booking.createStudioBooking.id,
            daysDelta: 0,
            idempotencyKey: `regular-reserve:${input.idempotencyKey}`,
            membershipId: membership.id,
            name: `Резерв · ${session.startsAt.slice(0, 16)}`,
            occurredAt: new Date().toISOString(),
            reason: 'Запись на занятие',
            transactionType: 'RESERVE',
            visitDelta: -1,
          },
        },
        id: true,
      },
    } as never);
  await synchronizeBookingMembership(client, membership.id);
  await synchronizeSessionBookedCount(client, session.id);

  await recordBookingEvent(
    {
      bookingId: booking.createStudioBooking.id,
      classSessionId: session.id,
      eventType: 'BOOKING_CREATED',
      idempotencyKey: input.idempotencyKey,
      membershipId: membership.id,
    },
    client,
  );
  return {
    success: true,
    bookingId: booking.createStudioBooking.id,
    duplicate: existingBooking !== undefined,
  };
};
