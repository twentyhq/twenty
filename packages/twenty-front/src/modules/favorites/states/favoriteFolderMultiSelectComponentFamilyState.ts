import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const favoriteFolderMultiSelectComponentFamilyState =
  createComponentFamilyState<FavoriteFolder | undefined, string>({
    key: 'favoriteFolderMultiSelectComponentFamilyState',
    defaultValue: undefined,
  });
