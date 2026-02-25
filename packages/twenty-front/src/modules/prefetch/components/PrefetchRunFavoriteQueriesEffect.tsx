import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useIsSettingsPage } from '@/navigation/hooks/useIsSettingsPage';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { findAllFavoritesFolderOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllFavoritesFolderOperationSignatureFactory';
import { findAllFavoritesOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllFavoritesOperationSignatureFactory';
import { prefetchFavoriteFoldersState } from '@/prefetch/states/prefetchFavoriteFoldersState';
import { prefetchFavoritesState } from '@/prefetch/states/prefetchFavoritesState';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useShowAuthModal } from '@/ui/layout/hooks/useShowAuthModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useCallback, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { type Favorite } from '@/favorites/types/Favorite';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { FeatureFlagKey } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { useStore } from 'jotai';

export const PrefetchRunFavoriteQueriesEffect = () => {
  const store = useStore();
  const isNavigationMenuItemEditingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_NAVIGATION_MENU_ITEM_EDITING_ENABLED,
  );
  const showAuthModal = useShowAuthModal();
  const isSettingsPage = useIsSettingsPage();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isWorkspaceActive =
    currentWorkspace?.activationStatus === WorkspaceActivationStatus.ACTIVE;

  const { objectMetadataItems } = useObjectMetadataItems();

  const setIsPrefetchFavoritesLoaded = useSetAtomFamilyState(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavorites,
  );

  const setIsPrefetchFavoritesFoldersLoaded = useSetAtomFamilyState(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavoritesFolders,
  );

  const setFavoritesState = useSetAtomState(prefetchFavoritesState);
  const setFavoriteFoldersState = useSetAtomState(prefetchFavoriteFoldersState);

  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });

  const findAllFavoritesOperationSignature =
    findAllFavoritesOperationSignatureFactory({
      objectMetadataItem: favoriteObjectMetadataItem,
      objectMetadataItems,
    });

  const findAllFavoriteFoldersOperationSignature =
    findAllFavoritesFolderOperationSignatureFactory({});

  const { records: favorites } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Favorite,
    filter: findAllFavoritesOperationSignature.variables.filter,
    recordGqlFields: findAllFavoritesOperationSignature.fields,
    skip:
      showAuthModal ||
      isSettingsPage ||
      !isWorkspaceActive ||
      isNavigationMenuItemEditingEnabled,
  });

  const { records: favoriteFolders } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
    filter: findAllFavoriteFoldersOperationSignature.variables.filter,
    recordGqlFields: findAllFavoriteFoldersOperationSignature.fields,
    skip:
      showAuthModal ||
      isSettingsPage ||
      !isWorkspaceActive ||
      isNavigationMenuItemEditingEnabled,
  });

  const setPrefetchFavoritesStateIfChanged = useCallback(
    (newFavorites: Favorite[]) => {
      const existingFavorites = store.get(prefetchFavoritesState.atom);
      if (!isDeeplyEqual(existingFavorites, newFavorites)) {
        setFavoritesState(newFavorites);
      }
    },
    [setFavoritesState, store],
  );

  const setPrefetchFavoriteFoldersStateIfChanged = useCallback(
    (newFavoriteFolders: FavoriteFolder[]) => {
      const existingFavoriteFolders = store.get(
        prefetchFavoriteFoldersState.atom,
      );
      if (!isDeeplyEqual(existingFavoriteFolders, newFavoriteFolders)) {
        setFavoriteFoldersState(newFavoriteFolders);
      }
    },
    [setFavoriteFoldersState, store],
  );

  useEffect(() => {
    if (isDefined(favorites)) {
      setPrefetchFavoritesStateIfChanged(favorites as Favorite[]);
      setIsPrefetchFavoritesLoaded(true);
    }
  }, [
    favorites,
    setPrefetchFavoritesStateIfChanged,
    setIsPrefetchFavoritesLoaded,
  ]);

  useEffect(() => {
    if (isDefined(favoriteFolders)) {
      setPrefetchFavoriteFoldersStateIfChanged(
        favoriteFolders as FavoriteFolder[],
      );
      setIsPrefetchFavoritesFoldersLoaded(true);
    }
  }, [
    favoriteFolders,
    setPrefetchFavoriteFoldersStateIfChanged,
    setIsPrefetchFavoritesFoldersLoaded,
  ]);

  return <></>;
};
