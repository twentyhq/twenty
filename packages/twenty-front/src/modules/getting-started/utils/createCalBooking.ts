import { CAL_API } from '@/getting-started/constants/CalApi';
import { type CalEventTypeReference } from '@/getting-started/types/CalEventTypeReference';
import { doNotTranslate } from 'twenty-shared/i18n';

export const createCalBooking = async ({
  eventTypeReference,
  start,
  attendee,
  title,
}: {
  eventTypeReference: CalEventTypeReference;
  start: string;
  attendee: { name: string; email: string; timeZone: string };
  title: string;
}): Promise<void> => {
  const response = await fetch(`${CAL_API.url}/bookings`, {
    method: 'POST',
    headers: {
      'cal-api-version': CAL_API.bookingsVersion,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...eventTypeReference,
      start: new Date(start).toISOString(),
      attendee,
      bookingFieldsResponses: { title },
    }),
  });

  if (!response.ok) {
    throw new Error(
      doNotTranslate(`Cal.com booking request failed with ${response.status}`),
    );
  }
};
