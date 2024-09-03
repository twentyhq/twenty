import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const unsavedToDeleteViewFilterIdsInstanceState = createInstanceState<
  string[]
>({
  key: 'unsavedToDeleteViewFilterIdsInstanceState',
  defaultValue: [],
  instanceContext: ViewInstanceContext,
});
