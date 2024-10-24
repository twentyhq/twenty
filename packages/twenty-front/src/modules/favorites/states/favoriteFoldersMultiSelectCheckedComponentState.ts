import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const favoriteFoldersMultiSelectCheckedComponentState =
  createComponentState<string[]>({
    key: 'favoriteFoldersMultiSelectCheckedComponentState',
    defaultValue: [],
  });
