import { createState } from '@/ui/utilities/state/utils/createState';

export const calendarBookingPageIdState = createState<string | null>({
  key: 'calendarBookingPageIdState',
  defaultValue: null,
});
