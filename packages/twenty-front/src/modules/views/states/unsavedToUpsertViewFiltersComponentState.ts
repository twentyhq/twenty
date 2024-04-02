import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { ViewFilter } from '../types/ViewFilter';

export const unsavedToUpsertViewFiltersComponentState = createComponentState<
  ViewFilter[]
>({
  key: 'unsavedToUpsertViewFiltersComponentState',
  defaultValue: [],
});
