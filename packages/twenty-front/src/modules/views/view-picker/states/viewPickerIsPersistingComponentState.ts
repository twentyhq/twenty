import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerIsPersistingComponentState =
  createComponentState<boolean>({
    key: 'viewPickerIsPersistingComponentState',
    defaultValue: false,
    componentInstanceContext: ViewComponentInstanceContext,
  });
