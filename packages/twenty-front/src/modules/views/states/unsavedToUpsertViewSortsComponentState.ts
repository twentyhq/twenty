import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

import { ViewSort } from '../types/ViewSort';

export const unsavedToUpsertViewSortsComponentState = createComponentState<
  ViewSort[]
>({
  key: 'unsavedToUpsertViewSortsComponentState',
  defaultValue: [],
});
