import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';

export const viewPickerTypeComponentState = createComponentState<ViewType>({
  key: 'viewPickerTypeComponentState',
  defaultValue: ViewType.Table,
  componentInstanceContext: ViewComponentInstanceContext,
});
