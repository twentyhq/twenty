import { FavoriteFoldersScopeInternalContext } from '@/favorites/scopes/scope-internal-context/favoritesScopeInternalContext';
import { favoriteFolderMultiSelectComponentFamilyState } from '@/favorites/states/favoriteFolderMultiSelectComponentFamilyState';
import { favoriteFoldersIdsMultiSelectComponentState } from '@/favorites/states/favoriteFoldersIdsMultiSelectComponentState';
import { favoriteFoldersLoadingComponentState } from '@/favorites/states/favoriteFoldersLoadingComponentState';
import { favoriteFoldersMultiSelectCheckedComponentState } from '@/favorites/states/favoriteFoldersMultiSelectCheckedComponentState';
import { favoriteFoldersSearchFilterComponentState } from '@/favorites/states/favoriteFoldersSearchFilterComponentState';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { extractComponentFamilyState } from '@/ui/utilities/state/component-state/utils/extractComponentFamilyState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useFavoriteFoldersScopedStates = () => {
  const scopeId = useAvailableScopeIdOrThrow(
    FavoriteFoldersScopeInternalContext,
  );

  const favoriteFoldersSearchFilterState = extractComponentState(
    favoriteFoldersSearchFilterComponentState,
    scopeId,
  );

  const favoriteFoldersIdsMultiSelectState = extractComponentState(
    favoriteFoldersIdsMultiSelectComponentState,
    scopeId,
  );

  const favoriteFoldersLoadingState = extractComponentState(
    favoriteFoldersLoadingComponentState,
    scopeId,
  );

  const favoriteFoldersMultiSelectCheckedState = extractComponentState(
    favoriteFoldersMultiSelectCheckedComponentState,
    scopeId,
  );

  const favoriteFolderMultiSelectFamilyState = extractComponentFamilyState(
    favoriteFolderMultiSelectComponentFamilyState,
    scopeId,
  );

  return {
    scopeId,
    favoriteFoldersSearchFilterState,
    favoriteFoldersIdsMultiSelectState,
    favoriteFoldersLoadingState,
    favoriteFoldersMultiSelectCheckedState,
    favoriteFolderMultiSelectFamilyState,
  };
};
