import { createState } from '@/ui/utilities/state/utils/createState';

export const viewableCalendarEventIdState = createState<string | null>({
  key: 'viewableCalendarEventIdState',
  defaultValue: null,
});
