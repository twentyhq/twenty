import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isDraftingAdvancedFilterComponentState =
  createComponentStateV2<boolean>({
    key: 'isDraftingAdvancedFilterComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
