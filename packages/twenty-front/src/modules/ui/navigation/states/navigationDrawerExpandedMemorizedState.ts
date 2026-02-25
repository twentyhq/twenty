import { MOBILE_VIEWPORT } from 'twenty-ui/theme';

import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

const isMobile = window.innerWidth <= MOBILE_VIEWPORT;

export const navigationDrawerExpandedMemorizedState = createAtomState<boolean>({
  key: 'navigationDrawerExpandedMemorizedState',
  defaultValue: !isMobile,
});
