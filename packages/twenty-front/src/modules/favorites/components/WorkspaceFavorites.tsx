import { useFilteredObjectMetadataItemsForWorkspaceFavorites } from '@/navigation/hooks/useObjectMetadataItemsInWorkspaceFavorites';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';

export const WorkspaceFavorites = () => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const { activeObjectMetadataItems: objectMetadataItemsToDisplay } =
    useFilteredObjectMetadataItemsForWorkspaceFavorites();

  const loading = useIsPrefetchLoading();
  if (loading) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={'Workspace'}
      objectMetadataItems={objectMetadataItemsToDisplay}
      views={views}
      isRemote={false}
    />
  );
};
