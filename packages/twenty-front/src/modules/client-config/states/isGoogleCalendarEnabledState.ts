import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isGoogleCalendarEnabledState = createAtomState<boolean>({
  key: 'isGoogleCalendarEnabled',
  defaultValue: false,
});
