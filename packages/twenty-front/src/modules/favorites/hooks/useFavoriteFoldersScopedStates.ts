import { FavoriteFoldersScopeInternalContext } from '@/favorites/scopes/scope-internal-context/favoritesScopeInternalContext';
import { favoriteFoldersLoadingFamilyState } from '@/favorites/states/favoriteFoldersLoadingFamilyState';
import { favoriteFoldersMultiSelectCheckedFamilyState } from '@/favorites/states/favoriteFoldersMultiSelectCheckedFamilyState';
import { favoriteFoldersIdsMultiSelectFamilyState } from '@/favorites/states/favoriteFoldersMultiSelectFamilyState';
import { favoriteFoldersSearchFilterFamilyState } from '@/favorites/states/favoriteFoldersSearchFilterFamilyState';
import { selectedFavoriteFoldersFamilyState } from '@/favorites/states/selectedFavoriteFoldersFamilyState';

import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';

export const useFavoriteFoldersScopedStates = () => {
  const scopeId = useAvailableScopeIdOrThrow(
    FavoriteFoldersScopeInternalContext,
  );

  return {
    favoritesSearchFilterState: favoriteFoldersSearchFilterFamilyState(scopeId),
    selectedFavoritesState: selectedFavoriteFoldersFamilyState(scopeId),
    favoriteFoldersIdsMultiSelectState:
      favoriteFoldersIdsMultiSelectFamilyState(scopeId),
    favoriteFoldersLoadingState: favoriteFoldersLoadingFamilyState(scopeId),
    favoriteFoldersMultiSelectCheckedState:
      favoriteFoldersMultiSelectCheckedFamilyState(scopeId),
  };
};
