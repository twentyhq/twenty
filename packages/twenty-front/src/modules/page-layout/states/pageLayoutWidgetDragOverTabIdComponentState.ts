import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

import { PageLayoutComponentInstanceContext } from './contexts/PageLayoutComponentInstanceContext';

export const pageLayoutWidgetDragOverTabIdComponentState =
  createAtomComponentState<string | null>({
    key: 'pageLayoutWidgetDragOverTabIdComponentState',
    defaultValue: null,
    componentInstanceContext: PageLayoutComponentInstanceContext,
  });
