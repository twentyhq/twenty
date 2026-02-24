import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const currentMobileNavigationDrawerState = createState<
  'main' | 'settings'
>({
  key: 'currentMobileNavigationDrawerState',
  defaultValue: 'main',
});
