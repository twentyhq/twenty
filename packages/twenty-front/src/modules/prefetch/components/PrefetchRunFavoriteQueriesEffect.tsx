import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type Favorite } from '@/favorites/types/Favorite';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
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
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const PrefetchRunFavoriteQueriesEffect = () => {
  const showAuthModal = useShowAuthModal();
  const isSettingsPage = useIsSettingsPage();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isWorkspaceActive =
    currentWorkspace?.activationStatus === WorkspaceActivationStatus.ACTIVE;

  const { objectMetadataItems } = useObjectMetadataItems();

  const setIsPrefetchFavoritesLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );

  const setIsPrefetchFavoritesFoldersLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

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
    skip: showAuthModal || isSettingsPage || !isWorkspaceActive,
  });

  const { records: favoriteFolders } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
    filter: findAllFavoriteFoldersOperationSignature.variables.filter,
    recordGqlFields: findAllFavoriteFoldersOperationSignature.fields,
    skip: showAuthModal || isSettingsPage || !isWorkspaceActive,
  });

  const setPrefetchFavoritesState = useRecoilCallback(
    ({ set, snapshot }) =>
      (favorites: Favorite[]) => {
        const existingFavorites = snapshot
          .getLoadable(prefetchFavoritesState)
          .getValue();

        if (!isDeeplyEqual(existingFavorites, favorites)) {
          set(prefetchFavoritesState, favorites);
        }
      },
    [],
  );

  const setPrefetchFavoriteFoldersState = useRecoilCallback(
    ({ set, snapshot }) =>
      (favoriteFolders: FavoriteFolder[]) => {
        const existingFavoriteFolders = snapshot
          .getLoadable(prefetchFavoriteFoldersState)
          .getValue();

        if (!isDeeplyEqual(existingFavoriteFolders, favoriteFolders)) {
          set(prefetchFavoriteFoldersState, favoriteFolders);
        }
      },
    [],
  );

  useEffect(() => {
    if (isDefined(favorites)) {
      setPrefetchFavoritesState(favorites as Favorite[]);
      setIsPrefetchFavoritesLoaded(true);
    }
  }, [favorites, setPrefetchFavoritesState, setIsPrefetchFavoritesLoaded]);

  useEffect(() => {
    if (isDefined(favoriteFolders)) {
      setPrefetchFavoriteFoldersState(favoriteFolders as FavoriteFolder[]);
      setIsPrefetchFavoritesFoldersLoaded(true);
    }
  }, [
    favoriteFolders,
    setPrefetchFavoriteFoldersState,
    setIsPrefetchFavoritesFoldersLoaded,
  ]);

  return <></>;
};
