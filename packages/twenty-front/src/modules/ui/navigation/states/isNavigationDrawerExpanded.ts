import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavigationDrawerExpandedState = createState<boolean>({
  key: 'isNavigationDrawerExpanded',
  defaultValue: !isMobile,
  useLocalStorage: true,
});
