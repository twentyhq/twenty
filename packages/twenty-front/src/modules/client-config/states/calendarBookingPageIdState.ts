import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const calendarBookingPageIdState = createState<string | null>({
  key: 'calendarBookingPageIdState',
  defaultValue: null,
});
