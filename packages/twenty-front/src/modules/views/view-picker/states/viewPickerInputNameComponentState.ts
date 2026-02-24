import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerInputNameComponentState = createComponentState<string>({
  key: 'viewPickerInputNameComponentState',
  defaultValue: '',
  componentInstanceContext: ViewComponentInstanceContext,
});
