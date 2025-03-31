import { createState } from "twenty-ui";

export const isGoogleCalendarEnabledState = createState<boolean>({
  key: 'isGoogleCalendarEnabled',
  defaultValue: false,
});
