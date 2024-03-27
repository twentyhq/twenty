import { createState } from 'twenty-ui';

export const activityIdInDrawerState = createState<string | null>({
  key: 'activityIdInDrawerState',
  defaultValue: null,
});
