import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewVisibility } from '@/views/types/ViewVisibility';

export const viewPickerVisibilityComponentState =
  createComponentState<ViewVisibility>({
    key: 'viewPickerVisibilityComponentState',
    defaultValue: ViewVisibility.WORKSPACE,
    componentInstanceContext: ViewComponentInstanceContext,
  });
