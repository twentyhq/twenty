import { createStateWithLocalStorageV2 } from '@/ui/utilities/state/jotai/utils/createStateWithLocalStorageV2';
import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const isNavigationDrawerExpandedState =
  createStateWithLocalStorageV2<boolean>({
    key: 'isNavigationDrawerExpanded',
    defaultValue: !isMobile,
  });
