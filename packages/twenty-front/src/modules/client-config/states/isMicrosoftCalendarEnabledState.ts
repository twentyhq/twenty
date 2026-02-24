import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isMicrosoftCalendarEnabledState = createState<boolean>({
  key: 'isMicrosoftCalendarEnabled',
  defaultValue: false,
});
