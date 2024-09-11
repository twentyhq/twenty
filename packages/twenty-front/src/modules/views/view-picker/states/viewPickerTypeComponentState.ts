import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';

export const viewPickerTypeComponentState = createComponentStateV2<ViewType>({
  key: 'viewPickerTypeComponentState',
  defaultValue: ViewType.Table,
  componentInstanceContext: ViewComponentInstanceContext,
});
