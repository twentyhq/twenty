import { createComponentState } from 'twenty-ui';

import { ViewSort } from '../types/ViewSort';

export const unsavedToUpsertViewSortsComponentState = createComponentState<
  ViewSort[]
>({
  key: 'unsavedToUpsertViewSortsComponentState',
  defaultValue: [],
});
