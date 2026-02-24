import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const NAVIGATION_DRAWER_WIDTH_VAR = '--navigation-drawer-width';

export const navigationDrawerWidthState = createState<number>({
  key: 'navigationDrawerWidth',
  defaultValue: NAVIGATION_DRAWER_CONSTRAINTS.default,
  useLocalStorage: true,
});
