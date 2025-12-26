import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const viewPickerMainGroupByFieldMetadataIdComponentState =
  createComponentState<string>({
    key: 'viewPickerMainGroupByFieldMetadataIdComponentState',
    defaultValue: '',
    componentInstanceContext: ViewComponentInstanceContext,
  });
