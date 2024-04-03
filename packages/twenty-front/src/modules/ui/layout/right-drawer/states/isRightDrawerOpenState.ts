import { createState } from 'twenty-ui';

export const isRightDrawerOpenState = createState<boolean>({
  key: 'ui/layout/is-right-drawer-open',
  defaultValue: false,
});
