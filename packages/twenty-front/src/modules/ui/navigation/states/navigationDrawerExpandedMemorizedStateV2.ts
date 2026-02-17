import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const navigationDrawerExpandedMemorizedStateV2 = createStateV2<boolean>({
  key: 'navigationDrawerExpandedMemorizedStateV2',
  defaultValue: !isMobile,
});
