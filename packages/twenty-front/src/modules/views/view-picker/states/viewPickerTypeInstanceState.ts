import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';
import { ViewType } from '@/views/types/ViewType';

export const viewPickerTypeInstanceState = createInstanceState<ViewType>({
  key: 'viewPickerTypeInstanceState',
  defaultValue: ViewType.Table,
  instanceContext: ViewInstanceContext,
});
