import { CoreApiClient } from 'twenty-client-sdk/core';

import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';

type RelatedRecord = { id: string } | null;

type RegularBookingInput = {
  classSessionId: string;
  idempotencyKey: string;
  membershipId: string;
  personId: string;
};

type Membership = {
  id: string;
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
    return fail(400, 'INVALID_INPUT', 'Клиент, пакет, слот и ключ операции обязательны.');
  }

  const bookingKey = `regular-booking:${input.idempotencyKey}`;
  const result = (await client.query({
    studioMemberships: {
      __args: { filter: { id: { eq: input.membershipId } }, first: 1 },
      edges: {
        node: {
          id: true,
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
      edges: { node: { id: true } },
    },
  } as never)) as unknown as {
    classSessions?: { edges?: Array<{ node: Session }> };
    studioBookings?: { edges?: Array<{ node: { id: string } }> };
    studioMemberships?: { edges?: Array<{ node: Membership }> };
  };

  const existingBooking = result.studioBookings?.edges?.[0]?.node;
  if (existingBooking !== undefined) {
    return { success: true, bookingId: existingBooking.id, duplicate: true };
  }

  const membership = result.studioMemberships?.edges?.[0]?.node;
  const session = result.classSessions?.edges?.[0]?.node;
  if (membership === undefined || membership.person?.id !== input.personId) {
    return fail(404, 'MEMBERSHIP_NOT_FOUND', 'Пакет клиента не найден.');
  }
  if (session === undefined) return fail(404, 'SESSION_NOT_FOUND', 'Слот не найден.');
  if (membership.status !== 'ACTIVE' || membership.visitsAvailable < 1) {
    return fail(409, 'INSUFFICIENT_BALANCE', 'У клиента нет доступных посещений.');
  }
  if (
    membership.product === null ||
    membership.product.sessionFormat !== session.sessionFormat
  ) {
    return fail(409, 'PRODUCT_MISMATCH', 'Пакет не подходит к формату занятия.');
  }
  if (!['PLANNED', 'CONFIRMED'].includes(session.status)) {
    return fail(409, 'SESSION_NOT_BOOKABLE', 'На этот слот нельзя записаться.');
  }
  if (new Date(session.startsAt) <= new Date()) {
    return fail(409, 'SESSION_IN_PAST', 'Запись возможна только на будущий слот.');
  }
  if (session.bookedCount >= session.capacity) {
    return fail(409, 'INSUFFICIENT_CAPACITY', 'На занятии больше нет свободных мест.');
  }

  const bookingType =
    membership.product.category === 'PERSONAL' ? 'PERSONAL' : 'REGULAR';
  const booking = (await client.mutation({
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
  } as never)) as unknown as { createStudioBooking: { id: string } };

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
  await client.mutation({
    updateStudioMembership: {
      __args: {
        id: membership.id,
        data: {
          visitsAvailable: membership.visitsAvailable - 1,
          visitsReserved: membership.visitsReserved + 1,
        },
      },
      id: true,
    },
  } as never);
  await client.mutation({
    updateClassSession: {
      __args: { id: session.id, data: { bookedCount: session.bookedCount + 1 } },
      id: true,
    },
  } as never);

  await recordStudioEvent({ bookingId: booking.createStudioBooking.id, classSessionId: session.id, eventType: 'BOOKING_CREATED', idempotencyKey: input.idempotencyKey, membershipId: membership.id, outcome: 'SUCCESS' }, client);
  return { success: true, bookingId: booking.createStudioBooking.id, duplicate: false };
};
