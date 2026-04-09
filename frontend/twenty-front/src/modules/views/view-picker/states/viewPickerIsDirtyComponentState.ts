import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerIsDirtyComponentState =
  createAtomComponentState<boolean>({
    key: 'viewPickerIsDirtyComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
