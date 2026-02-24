import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const calendarBookingPageIdState = createStateV2<string | null>({
  key: 'calendarBookingPageIdState',
  defaultValue: null,
});
