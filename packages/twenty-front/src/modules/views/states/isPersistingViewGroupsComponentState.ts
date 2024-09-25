import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isPersistingViewGroupsComponentState =
  createComponentStateV2<boolean>({
    key: 'isPersistingViewGroupsComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
