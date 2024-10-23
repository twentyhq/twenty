import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const favoriteFoldersIdsMultiSelectComponentState = createComponentState<
  string[]
>({
  key: 'favoriteFoldersIdsMultiSelectComponentState',
  defaultValue: [],
});
