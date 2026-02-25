import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const isPageLayoutTabDraggingComponentState =
  createAtomComponentState<boolean>({
    key: 'isPageLayoutTabDraggingComponentState',
    defaultValue: false,
    componentInstanceContext: TabListComponentInstanceContext,
  });
