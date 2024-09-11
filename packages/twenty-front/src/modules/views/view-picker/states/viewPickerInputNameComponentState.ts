import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerInputNameComponentState = createComponentStateV2<string>(
  {
    key: 'viewPickerInputNameComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  },
);
