import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const viewPickerModeInstanceState = createInstanceState<
  'list' | 'edit' | 'create'
>({
  key: 'viewEditModeInstanceState',
  defaultValue: 'list',
  instanceContext: ViewInstanceContext,
});
