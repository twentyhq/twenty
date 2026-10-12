import { CoreApiClient } from 'twenty-client-sdk/core';

type StudioEventInput = {
  bookingId?: string;
  classSessionId?: string;
  details?: string;
  eventType: 'BOOKING_CREATED' | 'BOOKING_CANCELLED' | 'OPERATION_FAILED' | 'PAYMENT_CONFIRMED' | 'SESSION_CREATED';
  idempotencyKey?: string;
  membershipId?: string;
  outcome: 'SUCCESS' | 'FAILURE';
};

export const recordStudioEvent = async (
  input: StudioEventInput,
  client = new CoreApiClient(),
): Promise<void> => {
  try {
    await client.mutation({
      createStudioEvent: {
        __args: { data: {
          name: input.eventType === 'BOOKING_CREATED' ? 'Создание записи' : input.eventType === 'BOOKING_CANCELLED' ? 'Отмена записи' : input.eventType === 'SESSION_CREATED' ? 'Создание занятия' : input.eventType === 'PAYMENT_CONFIRMED' ? 'Подтверждение оплаты' : 'Ошибка операции',
          eventType: input.eventType,
          outcome: input.outcome,
          occurredAt: new Date().toISOString(),
          idempotencyKey: input.idempotencyKey ?? null,
          bookingId: input.bookingId ?? null,
          membershipId: input.membershipId ?? null,
          classSessionId: input.classSessionId ?? null,
          details: input.details ?? null,
        } },
        id: true,
      },
    } as never);
  } catch {
    // Observability must not prevent the business operation from completing.
  }
};
