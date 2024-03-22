import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewType } from '@/views/types/ViewType';

export const viewPickerTypeComponentState = createComponentState<ViewType>({
  key: 'viewPickerTypeComponentState',
  defaultValue: ViewType.Table,
});
