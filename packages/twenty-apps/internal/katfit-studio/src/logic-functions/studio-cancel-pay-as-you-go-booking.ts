import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { Response } from 'twenty-sdk/logic-function';

import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';

type Input = { bookingId: string; cancelledAt: string; idempotencyKey: string };

export default defineLogicFunction({
  universalIdentifier: 'd7da98d1-e5dc-40bf-8ad3-52b59bdfa48d',
  name: 'studio-cancel-pay-as-you-go-booking',
  description: 'Cancel a pay-as-you-go booking and waive its expected payment',
  timeoutSeconds: 30,
  handler: async (routePayload: RoutePayload<Input>) => {
    const input = (routePayload.body ?? {}) as Input;
    const fail = async (status: number, message: string) => {
      await recordStudioEvent({
        bookingId: input.bookingId,
        details: message,
        eventType: 'OPERATION_FAILED',
        idempotencyKey: input.idempotencyKey,
        outcome: 'FAILURE',
      });

      return new Response({ success: false, message }, { status });
    };

    try {
      if (!input.bookingId || !input.cancelledAt) return fail(400, 'Укажите запись и время отмены.');
      const client = new CoreApiClient();
      const result = (await client.query({ studioBookings: { __args: { filter: { id: { eq: input.bookingId } }, first: 1 }, edges: { node: { classSessionId: true, id: true, paymentStatus: true, status: true } } }, studioPayments: { __args: { filter: { externalId: { eq: `pay-as-you-go:${input.bookingId}` } }, first: 2 }, edges: { node: { id: true, status: true } } } } as never)) as unknown as { studioBookings?: { edges?: Array<{ node: { classSessionId: string; id: string; paymentStatus: string; status: string } }> }; studioPayments?: { edges?: Array<{ node: { id: string; status: string } }> } };
      const booking = result.studioBookings?.edges?.[0]?.node;
      const payment = result.studioPayments?.edges?.[0]?.node;
      if (booking === undefined || payment === undefined) return fail(404, 'Запись или ожидаемая оплата не найдены.');
      if (booking.status === 'CANCELLED_BY_STUDIO' && booking.paymentStatus === 'WAIVED') return new Response({ success: true, duplicate: true }, { status: 200 });
      if (booking.status !== 'BOOKED' || booking.paymentStatus !== 'EXPECTED' || payment.status !== 'EXPECTED') return fail(409, 'Отменить можно только активную неоплаченную запись.');
      await client.mutation({ updateStudioPayment: { __args: { id: payment.id, data: { status: 'FAILED' } }, id: true }, updateStudioBooking: { __args: { id: booking.id, data: { cancelledAt: input.cancelledAt, paymentStatus: 'WAIVED', status: 'CANCELLED_BY_STUDIO' } }, id: true } } as never);
      await recordStudioEvent({ bookingId: booking.id, classSessionId: booking.classSessionId, eventType: 'BOOKING_CANCELLED', idempotencyKey: input.idempotencyKey, outcome: 'SUCCESS' }, client);
      return new Response({ success: true, duplicate: false }, { status: 200 });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка отмены записи.';

      return fail(500, message);
    }
  },
  httpRouteTriggerSettings: { path: '/studio/bookings/cancel-pay-as-you-go', httpMethod: 'POST', isAuthRequired: true },
});
