import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerIsPersistingComponentState =
  createComponentStateV2<boolean>({
    key: 'viewPickerIsPersistingComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
