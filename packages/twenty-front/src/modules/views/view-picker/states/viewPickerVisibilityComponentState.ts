import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewVisibility } from '@/views/types/ViewVisibility';

export const viewPickerVisibilityComponentState =
  createComponentState<ViewVisibility>({
    key: 'viewPickerVisibilityComponentState',
    defaultValue: ViewVisibility.PUBLIC,
  });

