import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavigationDrawerExpandedState = createStateV2<boolean>({
  key: 'isNavigationDrawerExpanded',
  defaultValue: !isMobile,
  useLocalStorage: true,
});
