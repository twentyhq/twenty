import { NAVIGATION_DRAWER_CONSTRAINTS } from '@/ui/layout/resizable-panel/constants/NavigationDrawerConstraints';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const NAVIGATION_DRAWER_WIDTH_VAR = '--navigation-drawer-width';

export const navigationDrawerWidthState = createStateV2<number>({
  key: 'navigationDrawerWidth',
  defaultValue: NAVIGATION_DRAWER_CONSTRAINTS.default,
  useLocalStorage: true,
});
