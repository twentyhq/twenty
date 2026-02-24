import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const objectOptionsDropdownSearchInputComponentState =
  createComponentStateV2<string>({
    key: 'objectOptionsDropdownSearchInputComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
