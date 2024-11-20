import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';

export const useFilteredObjectMetadataItemsForWorkspaceFavorites = () => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const { sortedWorkspaceFavorites: workspaceFavorites } =
    useWorkspaceFavorites();

  const workspaceFavoriteIds = new Set(
    workspaceFavorites.map((favorite) => favorite.recordId),
  );

  const favoriteViewObjectMetadataIds = new Set(
    views.reduce<string[]>((acc, view) => {
      if (workspaceFavoriteIds.has(view.id)) {
        acc.push(view.objectMetadataId);
      }
      return acc;
    }, []),
  );

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  const activeObjectMetadataItemsInWorkspaceFavorites =
    activeObjectMetadataItems.filter((item) =>
      favoriteViewObjectMetadataIds.has(item.id),
    );

  return {
    activeObjectMetadataItems: activeObjectMetadataItemsInWorkspaceFavorites,
  };
};
