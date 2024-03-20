import { createComponentState } from 'twenty-ui';

export const unsavedToDeleteViewSortIdsComponentState = createComponentState<
  string[]
>({
  key: 'unsavedToDeleteViewSortIdsComponentState',
  defaultValue: [],
});
