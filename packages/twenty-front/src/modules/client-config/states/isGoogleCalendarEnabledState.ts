import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isGoogleCalendarEnabledState = createStateV2<boolean>({
  key: 'isGoogleCalendarEnabled',
  defaultValue: false,
});
