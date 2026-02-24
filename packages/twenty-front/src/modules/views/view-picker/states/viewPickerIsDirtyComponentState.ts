import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerIsDirtyComponentState = createComponentState<boolean>({
  key: 'viewPickerIsDirtyComponentState',
  defaultValue: false,
  componentInstanceContext: ViewComponentInstanceContext,
});
