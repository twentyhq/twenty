import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

import { createState } from '@/ui/utilities/state/jotai/utils/createState';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const navigationDrawerExpandedMemorizedStateV2 = createState<boolean>({
  key: 'navigationDrawerExpandedMemorizedStateV2',
  defaultValue: !isMobile,
});
