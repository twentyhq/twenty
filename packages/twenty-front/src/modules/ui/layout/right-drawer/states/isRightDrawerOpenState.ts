import { createState } from '@ui/utilities/state/utils/createState';

export const isRightDrawerOpenState = createState<boolean>({
  key: 'ui/layout/is-right-drawer-open',
  defaultValue: false,
});
