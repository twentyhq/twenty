import { recordExpectedPaymentEvent } from 'src/logic-functions/utils/expected-payment-event';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { recordBookingEvent } from 'src/logic-functions/utils/booking-event';

type CreatePayAsYouGoBookingInput = {
  classSessionId: string;
  idempotencyKey: string;
  personId: string;
  productId: string;
};

type PayAsYouGoProduct = {
  category: string;
  id: string;
  isActive: boolean;
  name: string;
  price: { amountMicros: number; currencyCode: string };
  sessionFormat: string;
};

type Session = {
  bookedCount: number;
  capacity: number;
  id: string;
  sessionFormat: string;
  startsAt: string;
  status: string;
};

export type CreatePayAsYouGoBookingResult =
  | { success: true; bookingId: string; duplicate: boolean; paymentId: string }
  | { success: false; code: string; message: string; status: number };

const fail = (
  status: number,
  code: string,
  message: string,
): CreatePayAsYouGoBookingResult => ({ success: false, status, code, message });

export const createPayAsYouGoBooking = async (
  rawInput: CreatePayAsYouGoBookingInput,
  client = new CoreApiClient(),
): Promise<CreatePayAsYouGoBookingResult> => {
  const input = Object.fromEntries(
    Object.entries(rawInput).map(([key, value]) => [
      key,
      String(value ?? '').trim(),
    ]),
  ) as CreatePayAsYouGoBookingInput;
  if (Object.values(input).some((value) => value === ''))
    return fail(
      400,
      'INVALID_INPUT',
      'Клиент, услуга, слот и ключ операции обязательны.',
    );

  const bookingKey = `pay-as-you-go-booking:${input.idempotencyKey}`;
  const paymentKey = `pay-as-you-go-payment:${input.idempotencyKey}`;
  const result = (await client.query({
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
    studioPayments: {
      __args: { filter: { idempotencyKey: { eq: paymentKey } }, first: 1 },
      edges: { node: { id: true } },
    },
    studioProducts: {
      __args: { filter: { id: { eq: input.productId } }, first: 1 },
      edges: {
        node: {
          category: true,
          id: true,
          isActive: true,
          name: true,
          price: { amountMicros: true, currencyCode: true },
          sessionFormat: true,
        },
      },
    },
  } as never)) as unknown as {
    classSessions?: { edges?: Array<{ node: Session }> };
    studioBookings?: { edges?: Array<{ node: { id: string } }> };
    studioPayments?: { edges?: Array<{ node: { id: string } }> };
    studioProducts?: { edges?: Array<{ node: PayAsYouGoProduct }> };
  };

  const existingBooking = result.studioBookings?.edges?.[0]?.node;
  const existingPayment = result.studioPayments?.edges?.[0]?.node;
  if (existingBooking !== undefined && existingPayment !== undefined) {
    await recordExpectedPaymentEvent(
      {
        ...input,
        bookingId: existingBooking.id,
        paymentId: existingPayment.id,
      },
      client,
    );
    return {
      success: true,
      bookingId: existingBooking.id,
      paymentId: existingPayment.id,
      duplicate: true,
    };
  }
  if (existingBooking !== undefined || existingPayment !== undefined)
    return fail(
      409,
      'INCOMPLETE_DUPLICATE',
      'Операция уже начата. Повторите позже или обратитесь к администратору.',
    );

  const session = result.classSessions?.edges?.[0]?.node;
  const product = result.studioProducts?.edges?.[0]?.node;
  if (session === undefined)
    return fail(404, 'SESSION_NOT_FOUND', 'Слот не найден.');
  if (
    product === undefined ||
    !product.isActive ||
    !['SINGLE', 'PERSONAL'].includes(product.category)
  )
    return fail(
      409,
      'PRODUCT_NOT_BOOKABLE',
      'Выберите активную разовую или персональную услугу.',
    );
  if (product.sessionFormat !== session.sessionFormat)
    return fail(
      409,
      'PRODUCT_MISMATCH',
      'Услуга не подходит к формату занятия.',
    );
  if (
    !['PLANNED', 'CONFIRMED'].includes(session.status) ||
    new Date(session.startsAt) <= new Date()
  )
    return fail(409, 'SESSION_NOT_BOOKABLE', 'На этот слот нельзя записаться.');
  if (session.bookedCount >= session.capacity)
    return fail(
      409,
      'INSUFFICIENT_CAPACITY',
      'На занятии больше нет свободных мест.',
    );

  const booking = (await client.mutation({
    createStudioBooking: {
      __args: {
        data: {
          bookingType: product.category === 'PERSONAL' ? 'PERSONAL' : 'REGULAR',
          bookedAt: new Date().toISOString(),
          classSessionId: session.id,
          consumesVisit: false,
          externalId: bookingKey,
          name: `Запись · ${session.startsAt.slice(0, 16)}`,
          paymentStatus: 'EXPECTED',
          personId: input.personId,
          productId: product.id,
          status: 'BOOKED',
        },
      },
      id: true,
    },
  } as never)) as unknown as { createStudioBooking: { id: string } };
  const payment = (await client.mutation({
    createStudioPayment: {
      __args: {
        data: {
          amount: product.price,
          externalId: `pay-as-you-go:${booking.createStudioBooking.id}`,
          idempotencyKey: paymentKey,
          name: `К оплате · ${product.name} · ${session.startsAt.slice(0, 16)}`,
          personId: input.personId,
          status: 'EXPECTED',
        },
      },
      id: true,
    },
  } as never)) as unknown as { createStudioPayment: { id: string } };
  await client.mutation({
    updateClassSession: {
      __args: {
        id: session.id,
        data: { bookedCount: session.bookedCount + 1 },
      },
      id: true,
    },
  } as never);
  await recordExpectedPaymentEvent(
    {
      ...input,
      bookingId: booking.createStudioBooking.id,
      paymentId: payment.createStudioPayment.id,
    },
    client,
  );
  await recordBookingEvent(
    {
      bookingId: booking.createStudioBooking.id,
      classSessionId: session.id,
      eventType: 'BOOKING_CREATED',
      idempotencyKey: input.idempotencyKey,
      membershipId: '',
      details: `Оплата ожидается: ${payment.createStudioPayment.id}`,
    },
    client,
  );
  return {
    success: true,
    bookingId: booking.createStudioBooking.id,
    paymentId: payment.createStudioPayment.id,
    duplicate: false,
  };
};
