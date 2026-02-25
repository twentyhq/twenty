import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerSelectedIconComponentState =
  createAtomComponentState<string>({
    key: 'viewPickerSelectedIconComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
