import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isMobileNavigationBarVisibleState = createAtomState<boolean>({
  key: 'navigation/isMobileNavigationBarVisibleState',
  defaultValue: true,
});
