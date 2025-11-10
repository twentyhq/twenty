import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { IS_PAGE_LAYOUT_IN_EDIT_MODE_COMPONENT_STATE_KEY } from './constants/IsPageLayoutInEditModeComponentStateKey';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';
import { componentLocalStorageEffect } from './effects/componentLocalStorageEffect';

export const isPageLayoutInEditModeComponentState =
  createComponentState<boolean>({
    key: IS_PAGE_LAYOUT_IN_EDIT_MODE_COMPONENT_STATE_KEY,
    defaultValue: false,
    componentInstanceContext: PageLayoutComponentInstanceContext,
    effects: [componentLocalStorageEffect],
  });
