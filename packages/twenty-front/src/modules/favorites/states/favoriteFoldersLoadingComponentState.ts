import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const favoriteFoldersLoadingComponentState =
  createComponentState<boolean>({
    key: 'favoriteFoldersLoadingComponentState',
    defaultValue: false,
  });
