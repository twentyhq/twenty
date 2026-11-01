import { CoreApiClient } from 'twenty-client-sdk/core';
import { recordStudioEvent } from 'src/logic-functions/utils/studio-event';
import { synchronizeSessionBookedCount } from 'src/logic-functions/utils/booking-ledger';
export const cancelPayAsYouGoBooking = async (
  input: { bookingId: string; cancelledAt: string; idempotencyKey: string },
  client = new CoreApiClient(),
) => {
  const fail = async (status: number, message: string) => {
    await recordStudioEvent(
      {
        bookingId: input.bookingId,
        details: message,
        eventType: 'OPERATION_FAILED',
        idempotencyKey: input.idempotencyKey,
        outcome: 'FAILURE',
      },
      client,
    );

    return {
      success: false as const,
      code: 'CANCELLATION_FAILED',
      message,
      status,
    };
  };

  try {
    if (
      !input.bookingId ||
      !input.cancelledAt ||
      !input.idempotencyKey ||
      !Number.isFinite(Date.parse(input.cancelledAt)) ||
      Date.parse(input.cancelledAt) > Date.now()
    )
      return fail(400, 'Укажите запись и время отмены.');
    const result = (await client.query({
      studioBookings: {
        __args: { filter: { id: { eq: input.bookingId } }, first: 1 },
        edges: {
          node: {
            classSessionId: true,
            id: true,
            paymentStatus: true,
            status: true,
          },
        },
      },
      studioPayments: {
        __args: {
          filter: { externalId: { eq: `pay-as-you-go:${input.bookingId}` } },
          first: 2,
        },
        edges: { node: { id: true, status: true } },
      },
    } as never)) as unknown as {
      studioBookings?: {
        edges?: Array<{
          node: {
            classSessionId: string;
            id: string;
            paymentStatus: string;
            status: string;
          };
        }>;
      };
      studioPayments?: {
        edges?: Array<{ node: { id: string; status: string } }>;
      };
    };
    if (
      result.studioBookings?.edges?.length !== 1 ||
      result.studioPayments?.edges?.length !== 1
    )
      return fail(409, 'Запись и ожидаемая оплата требуют проверки.');
    const booking = result.studioBookings?.edges?.[0]?.node;
    const payment = result.studioPayments?.edges?.[0]?.node;
    if (booking === undefined || payment === undefined)
      return fail(404, 'Запись или ожидаемая оплата не найдены.');
    if (
      booking.status === 'CANCELLED_BY_STUDIO' &&
      booking.paymentStatus === 'WAIVED'
    )
      return { success: true as const, duplicate: true };
    if (
      booking.status !== 'BOOKED' ||
      booking.paymentStatus !== 'EXPECTED' ||
      payment.status !== 'EXPECTED'
    )
      return fail(409, 'Отменить можно только активную неоплаченную запись.');
    await client.mutation({
      updateStudioPayment: {
        __args: { id: payment.id, data: { status: 'FAILED' } },
        id: true,
      },
      updateStudioBooking: {
        __args: {
          id: booking.id,
          data: {
            cancelledAt: input.cancelledAt,
            paymentStatus: 'WAIVED',
            status: 'CANCELLED_BY_STUDIO',
          },
        },
        id: true,
      },
    } as never);
    await synchronizeSessionBookedCount(client, booking.classSessionId);
    await recordStudioEvent(
      {
        bookingId: booking.id,
        classSessionId: booking.classSessionId,
        eventType: 'BOOKING_CANCELLED',
        idempotencyKey: input.idempotencyKey,
        outcome: 'SUCCESS',
      },
      client,
    );
    return { success: true as const, duplicate: false };
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Неизвестная ошибка отмены записи.';

    return fail(500, message);
  }
};
