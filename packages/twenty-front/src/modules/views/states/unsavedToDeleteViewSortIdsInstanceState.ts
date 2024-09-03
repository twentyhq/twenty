import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';

export const unsavedToDeleteViewSortIdsInstanceState = createInstanceState<
  string[]
>({
  key: 'unsavedToDeleteViewSortIdsInstanceState',
  defaultValue: [],
  instanceContext: ViewInstanceContext,
});
