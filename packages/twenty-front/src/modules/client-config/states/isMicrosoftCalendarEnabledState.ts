import { createState } from 'twenty-ui';

export const isMicrosoftCalendarEnabledState = createState<boolean>({
  key: 'isMicrosoftCalendarEnabled',
  defaultValue: false,
});
