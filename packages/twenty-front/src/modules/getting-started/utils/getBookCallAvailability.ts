import { type BookCallSlot } from '@/getting-started/types/BookCallSlot';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const getBookCallAvailability = (
  slotsByDay: Record<string, BookCallSlot[]> | null,
): { availableDayKeys: string[]; nextSlot: BookCallSlot | undefined } => {
  const availableDays = Object.entries(slotsByDay ?? {})
    .filter(([, slots]) => isNonEmptyArray(slots))
    .sort(([dayKey], [otherDayKey]) => dayKey.localeCompare(otherDayKey));

  return {
    availableDayKeys: availableDays.map(([dayKey]) => dayKey),
    nextSlot: availableDays.at(0)?.[1].at(0),
  };
};
