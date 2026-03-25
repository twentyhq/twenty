import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { type TabLayouts } from '@/page-layout/types/TabLayouts';
import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutCurrentLayoutsComponentState =
  createAtomComponentState<TabLayouts>({
    key: 'pageLayoutCurrentLayoutsComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
