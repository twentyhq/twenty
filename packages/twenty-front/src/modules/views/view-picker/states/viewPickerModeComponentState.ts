import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewPickerMode } from '@/views/view-picker/types/ViewPickerMode';

export const viewPickerModeComponentState =
  createComponentStateV2<ViewPickerMode>({
    key: 'viewPickerModeComponentState',
    defaultValue: 'list',
    componentInstanceContext: ViewComponentInstanceContext,
  });
