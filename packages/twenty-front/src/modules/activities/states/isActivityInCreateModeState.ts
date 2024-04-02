import { createState } from 'twenty-ui';

export const isActivityInCreateModeState = createState<boolean>({
  key: 'isActivityInCreateModeState',
  defaultValue: false,
});
