import { createState } from "twenty-shared";

export const isRightDrawerOpenState = createState<boolean>({
  key: 'ui/layout/is-right-drawer-open',
  defaultValue: false,
});
