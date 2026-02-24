import { TabListComponentInstanceContext } from '@/ui/layout/tab-list/states/contexts/TabListComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const isPageLayoutTabDraggingComponentState =
  createComponentStateV2<boolean>({
    key: 'isPageLayoutTabDraggingComponentState',
    defaultValue: false,
    componentInstanceContext: TabListComponentInstanceContext,
  });
