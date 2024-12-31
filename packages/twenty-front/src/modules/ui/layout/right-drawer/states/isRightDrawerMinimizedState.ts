import { createState } from '@ui/utilities/state/utils/createState';

export const isRightDrawerMinimizedState = createState<boolean>({
  key: 'ui/layout/is-right-drawer-minimized',
  defaultValue: false,
});
