import { createState } from '@/ui/utilities/state/utils/createState';

export const calendarEventIdWhenCalendarEventWasClosedState = createState<
  string | null
>({
  key: 'calendarEventIdWhenCalendarEventWasClosedState',
  defaultValue: null,
});
