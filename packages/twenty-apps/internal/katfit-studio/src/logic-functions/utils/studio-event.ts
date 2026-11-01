import { CoreApiClient } from 'twenty-client-sdk/core';

type StudioEventInput = {
  bookingId?: string;
  classSessionId?: string;
  details?: string;
  eventType:
    | 'BOOKING_CREATED'
    | 'BOOKING_CANCELLED'
    | 'OPERATION_FAILED'
    | 'PAYMENT_CONFIRMED'
    | 'SESSION_CREATED'
    | 'SESSION_CANCELLED'
    | 'SESSION_UPDATED';
  idempotencyKey?: string;
  membershipId?: string;
  outcome: 'SUCCESS' | 'FAILURE';
};

export const recordStudioEvent = async (
  input: StudioEventInput,
  client = new CoreApiClient(),
): Promise<void> => {
  try {
    const result = (await client.mutation({
      createStudioEvent: {
        __args: {
          data: {
            name:
              input.eventType === 'BOOKING_CREATED'
                ? 'Создание записи'
                : input.eventType === 'BOOKING_CANCELLED'
                  ? 'Отмена записи'
                  : input.eventType === 'SESSION_UPDATED'
                    ? 'Изменение занятия'
                    : input.eventType === 'SESSION_CANCELLED'
                      ? 'Отмена занятия'
                      : input.eventType === 'SESSION_CREATED'
                        ? 'Создание занятия'
                        : input.eventType === 'PAYMENT_CONFIRMED'
                          ? 'Подтверждение оплаты'
                          : 'Ошибка операции',
            eventType: input.eventType,
            outcome: input.outcome,
            occurredAt: new Date().toISOString(),
            idempotencyKey: input.idempotencyKey ?? null,
            bookingId: input.bookingId ?? null,
            membershipId: input.membershipId ?? null,
            classSessionId: input.classSessionId ?? null,
            details: input.details ?? null,
          },
        },
        id: true,
      },
    } as never)) as unknown as { createStudioEvent?: { id?: string } };
    if (!result?.createStudioEvent?.id) {
      throw new Error('Audit write was not confirmed');
    }
  } catch {
    // Keep the original operation result, but make a missing audit visible in function logs.
    console.error(
      JSON.stringify({
        event: 'STUDIO_AUDIT_UNCONFIRMED',
        eventType: input.eventType,
        outcome: input.outcome,
        occurredAt: new Date().toISOString(),
        idempotencyKey: input.idempotencyKey ?? null,
        bookingId: input.bookingId ?? null,
        membershipId: input.membershipId ?? null,
        classSessionId: input.classSessionId ?? null,
      }),
    );
  }
};
