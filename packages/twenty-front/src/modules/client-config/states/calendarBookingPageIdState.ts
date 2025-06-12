import { createState } from 'twenty-ui/utilities';

export const calendarBookingPageIdState = createState<string | null>({
  key: 'calendarBookingPageIdState',
  defaultValue: null,
});
