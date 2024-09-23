import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const isPersistingViewFieldsComponentState =
  createComponentStateV2<boolean>({
    key: 'isPersistingViewFieldsComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
