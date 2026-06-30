import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const currentMobileNavigationDrawerState = createAtomState<
  'main' | 'settings'
>({
  key: 'currentMobileNavigationDrawerState',
  defaultValue: 'main',
});
