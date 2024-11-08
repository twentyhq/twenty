import { useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItemsForWorkspaceFavorites } from '@/navigation/hooks/useObjectMetadataItemsInWorkspaceFavorites';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';

export const NavigationDrawerOpenedSection = () => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const filteredActiveObjectMetadataItems = activeObjectMetadataItems.filter(
    (item) => !item.isRemote,
  );

  const loading = useIsPrefetchLoading();

  const currentObjectNamePlural = useParams().objectNamePlural;

  const { activeObjectMetadataItems: workspaceFavoritesObjectMetadataItems } =
    useFilteredObjectMetadataItemsForWorkspaceFavorites();

  if (!currentObjectNamePlural) {
    return;
  }

  const objectMetadataItem = filteredActiveObjectMetadataItems.find(
    (item) => item.namePlural === currentObjectNamePlural,
  );

  if (!objectMetadataItem) {
    return;
  }

  const shouldDisplayObjectInOpenedSection =
    !workspaceFavoritesObjectMetadataItems
      .map((item) => item.id)
      .includes(objectMetadataItem.id);

  if (loading) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  return (
    shouldDisplayObjectInOpenedSection && (
      <NavigationDrawerSectionForObjectMetadataItems
        sectionTitle={'Opened'}
        objectMetadataItems={[objectMetadataItem]}
        isRemote={false}
      />
    )
  );
};
