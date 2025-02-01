import { createState } from "twenty-shared";

export const isRightDrawerMinimizedState = createState<boolean>({
  key: 'ui/layout/is-right-drawer-minimized',
  defaultValue: false,
});
