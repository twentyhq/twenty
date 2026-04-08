import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export type WidgetInsertionContext = {
  targetWidgetId: string;
  direction: 'above' | 'below';
} | null;

export const widgetInsertionContextComponentState =
  createAtomComponentState<WidgetInsertionContext>({
    key: 'widgetInsertionContextComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
