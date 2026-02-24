import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type ViewPickerMode } from '@/views/view-picker/types/ViewPickerMode';

export const viewPickerModeComponentState =
  createComponentStateV2<ViewPickerMode>({
    key: 'viewPickerModeComponentState',
    defaultValue: 'list',
    componentInstanceContext: ViewComponentInstanceContext,
  });
