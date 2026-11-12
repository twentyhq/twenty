import { CAL_API } from '@/getting-started/constants/CalApi';
import { type BookCallSlot } from '@/getting-started/types/BookCallSlot';
import { type CalEventTypeReference } from '@/getting-started/types/CalEventTypeReference';
import { doNotTranslate } from 'twenty-shared/i18n';
import { CustomError } from 'twenty-shared/utils';
import { z } from 'zod';

const calSlotsResponseSchema = z.object({
  data: z.record(
    z.string(),
    z.array(z.object({ start: z.string(), end: z.string() })),
  ),
});

export const fetchCalSlotsOrThrow = async ({
  eventTypeReference,
  startDate,
  endDate,
  timeZone,
  signal,
}: {
  eventTypeReference: CalEventTypeReference;
  startDate: string;
  endDate: string;
  timeZone: string;
  signal: AbortSignal;
}): Promise<Record<string, BookCallSlot[]>> => {
  const searchParams = new URLSearchParams({
    ...eventTypeReference,
    start: startDate,
    end: endDate,
    timeZone,
    format: 'range',
  });

  const response = await fetch(`${CAL_API.url}/slots?${searchParams}`, {
    headers: { 'cal-api-version': CAL_API.slotsVersion },
    signal,
  });

  if (!response.ok) {
    throw new CustomError(
      doNotTranslate(`Cal.com slots request failed with ${response.status}`),
      'CAL_SLOTS_REQUEST_FAILED',
    );
  }

  return calSlotsResponseSchema.parse(await response.json()).data;
};
