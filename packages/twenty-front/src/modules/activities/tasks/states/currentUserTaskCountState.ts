import { createState } from 'twenty-ui';

export const currentUserDueTaskCountState = createState<number>({
  defaultValue: 0,
  key: 'currentUserDueTaskCountState',
});
