import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const NAVIGATION_DRAWER_WIDTH_VAR = '--navigation-drawer-width';

export const navigationDrawerWidthState = createAtomState<number>({
  key: 'navigationDrawerWidth',
  defaultValue: NAVIGATION_DRAWER_CONSTRAINTS.default,
  useLocalStorage: true,
});
