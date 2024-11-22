import { Favorite } from '@/favorites/types/Favorite';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { PREFETCH_CONFIG } from '@/prefetch/constants/PrefetchConfig';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const useDeleteFavoriteFolder = () => {
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { upsertRecordsInCache } = usePrefetchRunQuery<Favorite>({
    prefetchKey: PrefetchKey.AllFavorites,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular:
      PREFETCH_CONFIG[PrefetchKey.AllFavorites].objectNameSingular,
  });

  const { readFindManyRecordsQueryInCache } =
    useReadFindManyRecordsQueryInCache({
      objectMetadataItem,
    });

  const deleteFavoriteFolder = async (folderId: string): Promise<void> => {
    await deleteOneRecord(folderId);

    const allFavorites = readFindManyRecordsQueryInCache<Favorite>({
      queryVariables: {},
      recordGqlFields: PREFETCH_CONFIG[
        PrefetchKey.AllFavorites
      ].operationSignatureFactory({ objectMetadataItem }).fields,
    });

    const updatedFavorites = allFavorites.filter(
      (favorite) => favorite.favoriteFolderId !== folderId,
    );

    upsertRecordsInCache(updatedFavorites);
  };

  return {
    deleteFavoriteFolder,
  };
};
