import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerParentViewIdComponentState =
  createAtomComponentState<string>({
    key: 'viewPickerParentViewIdComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
