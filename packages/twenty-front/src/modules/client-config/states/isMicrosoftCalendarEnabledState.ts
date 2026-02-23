import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isMicrosoftCalendarEnabledState = createStateV2<boolean>({
  key: 'isMicrosoftCalendarEnabled',
  defaultValue: false,
});
