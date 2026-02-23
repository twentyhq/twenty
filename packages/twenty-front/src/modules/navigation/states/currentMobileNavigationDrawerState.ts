import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const currentMobileNavigationDrawerState = createStateV2<
  'main' | 'settings'
>({
  key: 'currentMobileNavigationDrawerState',
  defaultValue: 'main',
});
