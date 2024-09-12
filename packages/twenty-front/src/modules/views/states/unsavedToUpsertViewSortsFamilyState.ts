import { ViewSort } from '../types/ViewSort';

export const unsavedToUpsertViewSortsFamilyState = createFamilyState<
  ViewSort[],
  string
>({
  key: 'unsavedToUpsertViewSortsFamilyState',
  defaultValue: [],
});
