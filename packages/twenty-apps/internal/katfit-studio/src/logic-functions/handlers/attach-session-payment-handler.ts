import { CoreApiClient } from 'twenty-client-sdk/core';

import {
  getSessionPaymentContext,
  sessionPaymentFields,
  type SessionPayment,
  type SessionPaymentContext,
} from 'src/logic-functions/handlers/create-session-payment-handler';

export type PaidSessionParticipant = {
  personId: string;
  paymentId: string;
  productId: string;
};

export const readSessionPayment = async (
  participant: PaidSessionParticipant,
  session: Omit<SessionPaymentContext, 'personId' | 'productId'>,
  client: CoreApiClient,
): Promise<SessionPayment | null> => {
  const result = (await client.query({
    studioPayments: {
      __args: { filter: { id: { eq: participant.paymentId } }, first: 1 },
      edges: { node: sessionPaymentFields },
    },
  } as never)) as unknown as {
    studioPayments?: { edges?: Array<{ node: SessionPayment }> };
  };
  const payment = result.studioPayments?.edges?.[0]?.node;
  return payment &&
    payment.personId === participant.personId &&
    payment.status === (session.status === 'COMPLETED' ? 'PAID' : 'EXPECTED') &&
    payment.sessionPaymentContext ===
      getSessionPaymentContext({ ...participant, ...session })
    ? payment
    : null;
};

export const attachSessionPayment = async (
  participant: PaidSessionParticipant,
  session: Omit<SessionPaymentContext, 'personId' | 'productId'> & {
    id: string;
  },
  idempotencyKey: string,
  client: CoreApiClient,
): Promise<void> => {
  const payment = await readSessionPayment(participant, session, client);
  if (!payment) throw Error('SESSION_PAYMENT_MISMATCH');
  const externalId = `session-payment-booking:${payment.id}`;
  const existing = (await client.query({
    studioBookings: {
      __args: { filter: { externalId: { eq: externalId } }, first: 1 },
      edges: { node: { id: true, classSessionId: true, personId: true } },
    },
    classSessions: {
      __args: { filter: { id: { eq: session.id } }, first: 1 },
      edges: {
        node: { bookedCount: true, attendedCount: true, capacity: true },
      },
    },
  } as never)) as unknown as {
    studioBookings?: {
      edges?: Array<{
        node: { id: string; classSessionId: string; personId: string };
      }>;
    };
    classSessions?: {
      edges?: Array<{
        node: { bookedCount: number; attendedCount: number; capacity: number };
      }>;
    };
  };
  let booking = existing.studioBookings?.edges?.[0]?.node;
  if (
    booking &&
    (booking.classSessionId !== session.id ||
      booking.personId !== participant.personId)
  )
    throw Error('SESSION_PAYMENT_ALREADY_ATTACHED');
  if (!booking) {
    if (payment.externalId?.startsWith('pay-as-you-go:'))
      throw Error('SESSION_PAYMENT_ALREADY_ATTACHED');
    const counts = existing.classSessions?.edges?.[0]?.node;
    if (!counts || counts.bookedCount >= counts.capacity)
      throw Error('SESSION_PAYMENT_CAPACITY');
    const created = (await client.mutation({
      createStudioBooking: {
        __args: {
          data: {
            name: `Разовое посещение · ${session.startsAt}`,
            personId: participant.personId,
            productId: participant.productId,
            classSessionId: session.id,
            bookingType:
              session.sessionFormat === 'PERSONAL_EQUIPMENT'
                ? 'PERSONAL'
                : 'REGULAR',
            status: session.status === 'COMPLETED' ? 'ATTENDED' : 'BOOKED',
            paymentStatus: payment.status,
            consumesVisit: false,
            externalId,
            bookedAt: new Date().toISOString(),
            ...(session.status === 'COMPLETED'
              ? { recordedAt: new Date().toISOString() }
              : {}),
          },
        },
        id: true,
        classSessionId: true,
        personId: true,
      },
    } as never)) as unknown as {
      createStudioBooking?: {
        id: string;
        classSessionId: string;
        personId: string;
      };
    };
    booking = created.createStudioBooking;
    if (!booking?.id) throw Error('SESSION_PAYMENT_BOOKING_UNCONFIRMED');
    const updated = (await client.mutation({
      updateClassSession: {
        __args: {
          id: session.id,
          data: {
            bookedCount: counts.bookedCount + 1,
            attendedCount:
              counts.attendedCount + (session.status === 'COMPLETED' ? 1 : 0),
          },
        },
        id: true,
      },
    } as never)) as unknown as { updateClassSession?: { id: string } };
    if (updated.updateClassSession?.id !== session.id)
      throw Error('SESSION_COUNTS_UNCONFIRMED');
  }
  const linked = (await client.mutation({
    updateStudioPayment: {
      __args: {
        id: payment.id,
        data: { externalId: `pay-as-you-go:${booking.id}` },
      },
      id: true,
    },
  } as never)) as unknown as { updateStudioPayment?: { id: string } };
  if (linked.updateStudioPayment?.id !== payment.id)
    throw Error('SESSION_PAYMENT_LINK_UNCONFIRMED');
  const event = (await client.mutation({
    createStudioEvent: {
      __args: {
        data: {
          name: 'Разовый участник добавлен',
          eventType: 'BOOKING_CREATED',
          outcome: 'SUCCESS',
          classSessionId: session.id,
          bookingId: booking.id,
          idempotencyKey,
          occurredAt: new Date().toISOString(),
          details: JSON.stringify({
            paymentId: payment.id,
            paymentStatus: payment.status,
          }),
        },
      },
      id: true,
    },
  } as never)) as unknown as { createStudioEvent?: { id: string } };
  if (!event.createStudioEvent?.id)
    throw Error('SESSION_PAYMENT_BOOKING_AUDIT_UNCONFIRMED');
};
