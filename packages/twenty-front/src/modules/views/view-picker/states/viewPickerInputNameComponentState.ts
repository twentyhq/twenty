import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerInputNameComponentState = createComponentState<string>({
  key: 'viewPickerInputNameComponentState',
  defaultValue: '',
  componentInstanceContext: ViewComponentInstanceContext,
});
