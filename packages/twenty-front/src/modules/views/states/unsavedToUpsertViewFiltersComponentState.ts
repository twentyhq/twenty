import { createComponentState } from 'twenty-ui';

import { ViewFilter } from '../types/ViewFilter';

export const unsavedToUpsertViewFiltersComponentState = createComponentState<
  ViewFilter[]
>({
  key: 'unsavedToUpsertViewFiltersComponentState',
  defaultValue: [],
});
