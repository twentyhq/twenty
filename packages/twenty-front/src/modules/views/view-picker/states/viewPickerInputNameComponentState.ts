import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerInputNameComponentState =
  createAtomComponentState<string>({
    key: 'viewPickerInputNameComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
