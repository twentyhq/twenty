import { createState } from '@/ui/utilities/state/utils/createState';
export const isGoogleCalendarEnabledState = createState<boolean>({
  key: 'isGoogleCalendarEnabled',
  defaultValue: false,
});
