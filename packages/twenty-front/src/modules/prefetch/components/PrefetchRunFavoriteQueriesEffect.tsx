import { useEffect } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { Favorite } from '@/favorites/types/Favorite';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { findAllFavoritesFolderOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllFavoritesFolderOperationSignatureFactory';
import { findAllFavoritesOperationSignatureFactory } from '@/prefetch/graphql/operation-signatures/factories/findAllFavoritesOperationSignatureFactory';
import { prefetchFavoriteFoldersState } from '@/prefetch/states/prefetchFavoriteFoldersState';
import { prefetchFavoritesState } from '@/prefetch/states/prefetchFavoritesState';
import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { OnboardingStatus } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const PrefetchRunFavoriteQueriesEffect = () => {
  const onboardingStatus = useOnboardingStatus();

  const isWorkspaceActive = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.ACTIVE,
  );

  const { objectMetadataItems } = useObjectMetadataItems();

  const setIsPrefetchFavoritesLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );

  const setIsPrefetchFavoritesFoldersLoaded = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  const findAllFavoritesOperationSignature =
    findAllFavoritesOperationSignatureFactory({
      objectMetadataItem: objectMetadataItems.find(
        (item) => item.nameSingular === CoreObjectNameSingular.Favorite,
      ),
    });

  const findAllFavoriteFoldersOperationSignature =
    findAllFavoritesFolderOperationSignatureFactory({
      objectMetadataItem: objectMetadataItems.find(
        (item) => item.nameSingular === CoreObjectNameSingular.FavoriteFolder,
      ),
    });

  const { records: favorites } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Favorite,
    filter: findAllFavoritesOperationSignature.variables.filter,
    recordGqlFields: findAllFavoritesOperationSignature.fields,
    skip: onboardingStatus !== OnboardingStatus.COMPLETED || !isWorkspaceActive,
  });

  const { records: favoriteFolders } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
    filter: findAllFavoriteFoldersOperationSignature.variables.filter,
    recordGqlFields: findAllFavoriteFoldersOperationSignature.fields,
    skip: onboardingStatus !== OnboardingStatus.COMPLETED || !isWorkspaceActive,
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
