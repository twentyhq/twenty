import { createState } from 'twenty-ui';

export const viewableActivityIdState = createState<string | null>({
  key: 'activities/viewable-activity-id',
  defaultValue: null,
});
