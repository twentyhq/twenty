import { useFavorites } from '@/favorites/hooks/useFavorites';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';

export const useObjectMetadataItemsInWorkspaceFavorites = () => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const { workspaceFavorites } = useFavorites();

  const workspaceFavoriteIds = new Set(
    workspaceFavorites.map((favorite) => favorite.recordId),
  );

  const favoriteViewObjectMetadataIds = views.reduce<string[]>((acc, view) => {
    if (workspaceFavoriteIds.has(view.id)) {
      acc.push(view.objectMetadataId);
    }
    return acc;
  }, []);

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const objectMetadataItemsInWorkspaceFavorites = objectMetadataItems.filter(
    (item) => favoriteViewObjectMetadataIds.includes(item.id),
  );

  return {
    objectMetadataItems: objectMetadataItemsInWorkspaceFavorites,
  };
};
