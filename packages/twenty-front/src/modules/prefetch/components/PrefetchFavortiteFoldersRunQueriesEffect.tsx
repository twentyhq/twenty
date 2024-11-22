import { currentUserState } from '@/auth/states/currentUserState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useCombinedFindManyRecords } from '@/object-record/multiple-objects/hooks/useCombinedFindManyRecords';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from '~/utils/isDefined';

// TODO: Remove this component once we merge it with PrefetchRunQueriesEffect (once we remove feature flag)
export const PrefetchFavoriteFoldersRunQueriesEffect = () => {
  const currentUser = useRecoilValue(currentUserState);

  const { upsertRecordsInCache: upsertFavoritesFoldersInCache } =
    usePrefetchRunQuery<FavoriteFolder>({
      prefetchKey: PrefetchKey.AllFavoritesFolders,
    });

  const { objectMetadataItems } = useObjectMetadataItems();

  const operationSignatures = Object.values(PREFETCH_CONFIG)
    .filter(({ objectNameSingular }) => objectNameSingular === 'favoriteFolder')
    .map(({ objectNameSingular, operationSignatureFactory }) => {
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === objectNameSingular,
      );

      return operationSignatureFactory({ objectMetadataItem });
    });

  const { result } = useCombinedFindManyRecords({
    operationSignatures,
    skip: !currentUser,
  });

  useEffect(() => {
    if (isDefined(result.favoriteFolders)) {
      upsertFavoritesFoldersInCache(result.favoriteFolders as FavoriteFolder[]);
    }
  }, [result, upsertFavoritesFoldersInCache]);

  return null;
};
