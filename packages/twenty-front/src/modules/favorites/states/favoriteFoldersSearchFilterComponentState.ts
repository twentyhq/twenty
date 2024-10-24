import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const favoriteFoldersSearchFilterComponentState =
  createComponentState<string>({
    key: 'favoriteFoldersSearchFilterComponentState',
    defaultValue: '',
  });
