import { isDefined } from 'twenty-shared/utils';

import { FRONT_COMPONENT_HOST_UI_CLASS_NAME } from '@/constants/FrontComponentHostUiClassName';

export const isHostUiEvent = (nativeHostEvent: object): boolean =>
  'target' in nativeHostEvent &&
  nativeHostEvent.target instanceof Element &&
  isDefined(
    nativeHostEvent.target.closest(`.${FRONT_COMPONENT_HOST_UI_CLASS_NAME}`),
  );
