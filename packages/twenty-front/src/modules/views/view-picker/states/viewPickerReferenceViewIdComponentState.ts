import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerReferenceViewIdComponentState =
  createComponentState<string>({
    key: 'viewPickerReferenceViewIdComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
