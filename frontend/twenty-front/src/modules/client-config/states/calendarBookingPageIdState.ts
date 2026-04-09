import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const calendarBookingPageIdState = createAtomState<string | null>({
  key: 'calendarBookingPageIdState',
  defaultValue: null,
});
