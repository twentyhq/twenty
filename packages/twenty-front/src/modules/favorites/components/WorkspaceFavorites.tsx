import { useFavorites } from '@/favorites/hooks/useFavorites';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';

export const WorkspaceFavorites = () => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const loading = useIsPrefetchLoading();

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

  const objectMetadataItemsToDisplay = objectMetadataItems.filter((item) =>
    favoriteViewObjectMetadataIds.includes(item.id),
  );

  if (loading) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={'Workspace Favorites'}
      objectMetadataItems={objectMetadataItemsToDisplay}
      views={views}
      isRemote={false}
    />
  );
};
