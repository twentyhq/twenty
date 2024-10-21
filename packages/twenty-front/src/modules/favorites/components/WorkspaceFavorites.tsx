import { useFilteredObjectMetadataItemsForWorkspaceFavorites } from '@/navigation/hooks/useObjectMetadataItemsInWorkspaceFavorites';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';

export const WorkspaceFavorites = () => {
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
      isRemote={false}
    />
  );
};
