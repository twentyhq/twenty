import { createState } from 'twenty-ui';

export const actionBarOpenState = createState<boolean>({
  key: 'actionBarOpenState',
  defaultValue: false,
});
