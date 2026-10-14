import { CoreApiClient } from 'twenty-client-sdk/core';

type BookingEventInput = {
  bookingId: string;
  classSessionId: string;
  eventType: 'BOOKING_CREATED' | 'BOOKING_CANCELLED';
  idempotencyKey: string;
  membershipId: string;
};

export const recordBookingEvent = async (
  input: BookingEventInput,
  client: CoreApiClient,
): Promise<void> => {
  // The booking and action identify the event even when cancellation is retried with a new key.
  const name = new TextEncoder().encode(
    `studio-booking-event:${input.bookingId}:${input.eventType}`,
  );
  const namespacedName = new Uint8Array(16 + name.length);
  namespacedName.set(name, 16);
  const bytes = new Uint8Array(
    await crypto.subtle.digest('SHA-1', namespacedName),
  ).subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 80;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
  const eventId = [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
  const result = (await client.query({
    studioEvents: {
      __args: { filter: { id: { eq: eventId } }, first: 1 },
      edges: {
        node: {
          id: true,
          bookingId: true,
          classSessionId: true,
          membershipId: true,
          eventType: true,
          outcome: true,
        },
      },
    },
  } as never)) as unknown as {
    studioEvents?: {
      edges?: Array<{
        node: {
          id: string;
          bookingId: string;
          classSessionId: string;
          membershipId: string;
          eventType: string;
          outcome: string;
        };
      }>;
    };
  };
  const existing = result.studioEvents?.edges?.[0]?.node;
  if (existing) {
    if (
      existing.bookingId !== input.bookingId ||
      existing.classSessionId !== input.classSessionId ||
      existing.membershipId !== input.membershipId ||
      existing.eventType !== input.eventType ||
      existing.outcome !== 'SUCCESS'
    ) {
      throw new Error('Событие операции требует проверки журнала CRM.');
    }
    return;
  }
  const created = (await client.mutation({
    createStudioEvent: {
      __args: {
        data: {
          id: eventId,
          ...input,
          name:
            input.eventType === 'BOOKING_CREATED'
              ? 'Клиент добавлен в тренировку'
              : 'Клиент убран из тренировки студией',
          outcome: 'SUCCESS',
          occurredAt: new Date().toISOString(),
        },
      },
      id: true,
    },
  } as never)) as unknown as { createStudioEvent?: { id: string } };
  if (created.createStudioEvent?.id !== eventId)
    throw new Error(
      'Журнал операции не подтверждён. Повторите запрос с прежним ключом.',
    );
};
