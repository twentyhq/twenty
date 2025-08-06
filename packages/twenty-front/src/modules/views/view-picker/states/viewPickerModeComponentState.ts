import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewPickerMode } from '@/views/view-picker/types/ViewPickerMode';

export const viewPickerModeComponentState =
  createComponentState<ViewPickerMode>({
    key: 'viewPickerModeComponentState',
    defaultValue: 'list',
    componentInstanceContext: ViewComponentInstanceContext,
  });
