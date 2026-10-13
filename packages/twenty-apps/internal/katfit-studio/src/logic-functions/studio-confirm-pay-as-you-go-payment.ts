import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';

type Input = { bookingId: string; fiscalReceiptId?: string; paidAt?: string; paymentMethod: 'CARD' | 'CASH' | 'SBP' };

export default defineLogicFunction({
  universalIdentifier: '8c7655c3-0051-4e27-8de6-023d90b0e434',
  name: 'studio-confirm-pay-as-you-go-payment',
  description: 'Confirm an expected pay-as-you-go payment',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<Input>) => {
    const input = (routePayload.body ?? {}) as Input;
    const fail = async (status: number, message: string) => {
      await recordStudioEvent({
        bookingId: input.bookingId,
        details: message,
        eventType: 'OPERATION_FAILED',
        outcome: 'FAILURE',
      });

      return new Response({ success: false, message }, { status });
    };

    try {
      if (!input.bookingId || !['CASH', 'SBP', 'CARD'].includes(input.paymentMethod)) return fail(400, 'Укажите запись и способ оплаты.');
      const client = new CoreApiClient();
      const result = (await client.query({ studioBookings: { __args: { filter: { id: { eq: input.bookingId } }, first: 1 }, edges: { node: { id: true, classSessionId: true, paymentStatus: true, status: true } } }, studioPayments: { __args: { filter: { externalId: { eq: `pay-as-you-go:${input.bookingId}` } }, first: 2 }, edges: { node: { id: true, status: true } } } } as never)) as unknown as { studioBookings?: { edges?: Array<{ node: { classSessionId: string; id: string; paymentStatus: string; status: string } }> }; studioPayments?: { edges?: Array<{ node: { id: string; status: string } }> } };
      const booking = result.studioBookings?.edges?.[0]?.node;
      const payment = result.studioPayments?.edges?.[0]?.node;
      if (booking === undefined || payment === undefined) return fail(404, 'Ожидаемая оплата не найдена.');
      if (booking.paymentStatus === 'PAID' && payment.status === 'PAID') return new Response({ success: true, duplicate: true }, { status: 200 });
      if (booking.status !== 'ATTENDED' || booking.paymentStatus !== 'EXPECTED' || payment.status !== 'EXPECTED') return fail(409, 'Оплату можно подтвердить только после проведённого занятия.');
      await client.mutation({ updateStudioPayment: { __args: { id: payment.id, data: { fiscalReceiptId: input.fiscalReceiptId?.trim() || null, paidAt: input.paidAt ?? new Date().toISOString(), paymentMethod: input.paymentMethod, status: 'PAID' } }, id: true }, updateStudioBooking: { __args: { id: booking.id, data: { paymentStatus: 'PAID' } }, id: true } } as never);
      await recordStudioEvent({ bookingId: booking.id, classSessionId: booking.classSessionId, eventType: 'PAYMENT_CONFIRMED', outcome: 'SUCCESS' }, client);
      return new Response({ success: true, duplicate: false }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка подтверждения оплаты.';

      return fail(500, message);
    }
  },
  httpRouteTriggerSettings: { path: '/studio/bookings/confirm-pay-as-you-go-payment', httpMethod: 'POST', isAuthRequired: true },
});
