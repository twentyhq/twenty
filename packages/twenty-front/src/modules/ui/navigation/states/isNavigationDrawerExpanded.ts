import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavigationDrawerExpandedState = createAtomState<boolean>({
  key: 'isNavigationDrawerExpanded',
  defaultValue: !isMobile,
  useLocalStorage: true,
});
