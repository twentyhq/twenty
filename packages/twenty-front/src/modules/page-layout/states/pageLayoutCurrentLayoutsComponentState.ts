import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutCurrentLayoutsComponentState =
  createComponentStateV2<TabLayouts>({
    key: 'pageLayoutCurrentLayoutsComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
