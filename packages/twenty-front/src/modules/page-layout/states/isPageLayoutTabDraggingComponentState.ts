import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const isPageLayoutTabDraggingComponentState =
  createComponentState<boolean>({
    key: 'isPageLayoutTabDraggingComponentState',
    defaultValue: false,
    componentInstanceContext: TabListComponentInstanceContext,
  });
