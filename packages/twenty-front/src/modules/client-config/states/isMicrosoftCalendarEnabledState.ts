import { createState } from '@/ui/utilities/state/utils/createState';
export const isMicrosoftCalendarEnabledState = createState<boolean>({
  key: 'isMicrosoftCalendarEnabled',
  defaultValue: false,
});
