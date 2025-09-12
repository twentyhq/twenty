import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { type Layouts } from 'react-grid-layout';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export type TabLayouts = Record<string, Layouts>;

export const pageLayoutCurrentLayoutsComponentState =
  createComponentState<TabLayouts>({
    key: 'pageLayoutCurrentLayoutsComponentState',
    defaultValue: {},
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
