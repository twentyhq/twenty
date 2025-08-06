import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerSelectedIconComponentState =
  createComponentState<string>({
    key: 'viewPickerSelectedIconComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
