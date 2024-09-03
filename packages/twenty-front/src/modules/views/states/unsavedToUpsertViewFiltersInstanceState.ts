import { createInstanceState } from '@/ui/utilities/state/instance/utils/createIntanceState';
import { ViewInstanceContext } from '@/views/states/contexts/ViewInstanceContext';
import { ViewFilter } from '../types/ViewFilter';

export const unsavedToUpsertViewFiltersInstanceState = createInstanceState<
  ViewFilter[]
>({
  key: 'unsavedToUpsertViewFiltersInstanceState',
  defaultValue: [],
  instanceContext: ViewInstanceContext,
});
