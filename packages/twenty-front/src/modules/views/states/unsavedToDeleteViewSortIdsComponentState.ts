import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const unsavedToDeleteViewSortIdsComponentState = createComponentState<
  string[]
>({
  key: 'unsavedToDeleteViewSortIdsComponentState',
  defaultValue: [],
});
