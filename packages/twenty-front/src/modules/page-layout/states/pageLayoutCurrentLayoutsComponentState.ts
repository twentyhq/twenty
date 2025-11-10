import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { type TabLayouts } from '@/page-layout/types/tab-layouts';
import { PAGE_LAYOUT_CURRENT_LAYOUTS_COMPONENT_STATE_KEY } from './constants/PageLayoutCurrentLayoutsComponentStateKey';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';
import { componentLocalStorageEffect } from './effects/componentLocalStorageEffect';

export const pageLayoutCurrentLayoutsComponentState =
  createComponentState<TabLayouts>({
    key: PAGE_LAYOUT_CURRENT_LAYOUTS_COMPONENT_STATE_KEY,
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
    effects: [componentLocalStorageEffect()],
  });
