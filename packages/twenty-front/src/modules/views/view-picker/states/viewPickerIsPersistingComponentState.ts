import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerIsPersistingComponentState =
  createAtomComponentState<boolean>({
    key: 'viewPickerIsPersistingComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
