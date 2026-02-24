import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutCurrentLayoutsComponentState =
  createComponentState<TabLayouts>({
    key: 'pageLayoutCurrentLayoutsComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
