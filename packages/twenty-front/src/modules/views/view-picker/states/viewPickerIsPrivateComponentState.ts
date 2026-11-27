import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerIsPrivateComponentState =
  createAtomComponentState<boolean>({
    key: 'viewPickerIsPrivateComponentState',
    defaultValue: true,
    componentInstanceContext: ViewComponentInstanceContext,
  });
