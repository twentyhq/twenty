import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const objectOptionsDropdownSearchInputComponentState =
  createComponentState<string>({
    key: 'objectOptionsDropdownSearchInputComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
