import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const unsavedToDeleteViewFilterIdsComponentState = createComponentState<
  string[]
>({
  key: 'unsavedToDeleteViewFilterIdsComponentState',
  defaultValue: [],
});
