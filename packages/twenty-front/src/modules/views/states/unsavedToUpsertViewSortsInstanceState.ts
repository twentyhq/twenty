import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';
import { ViewSort } from '../types/ViewSort';

export const unsavedToUpsertViewSortsInstanceState = createInstanceState<
  ViewSort[]
>({
  key: 'unsavedToUpsertViewSortsInstanceState',
  defaultValue: [],
  instanceContext: ViewInstanceContext,
});
