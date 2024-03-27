import { createComponentState } from 'twenty-ui';

export const unsavedToDeleteViewFilterIdsComponentState = createComponentState<
  string[]
>({
  key: 'unsavedToDeleteViewFilterIdsComponentState',
  defaultValue: [],
});
