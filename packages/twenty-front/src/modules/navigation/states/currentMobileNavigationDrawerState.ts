import { createState } from '@ui/utilities/state/utils/createState';

export const currentMobileNavigationDrawerState = createState<
  'main' | 'settings'
>({
  key: 'currentMobileNavigationDrawerState',
  defaultValue: 'main',
});
