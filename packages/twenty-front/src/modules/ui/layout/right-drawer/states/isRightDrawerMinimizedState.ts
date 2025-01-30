import { createState } from 'twenty-ui';

export const isRightDrawerMinimizedState = createState<boolean>({
  key: 'ui/layout/is-right-drawer-minimized',
  defaultValue: false,
});
