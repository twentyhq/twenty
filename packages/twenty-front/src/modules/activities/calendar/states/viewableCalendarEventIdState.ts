import { createState } from 'twenty-ui';

export const viewableCalendarEventIdState = createState<string | null>({
  key: 'viewableCalendarEventIdState',
  defaultValue: null,
});
