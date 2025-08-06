import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerIsDirtyComponentState = createComponentState<boolean>({
  key: 'viewPickerIsDirtyComponentState',
  defaultValue: false,
  componentInstanceContext: ViewComponentInstanceContext,
});
