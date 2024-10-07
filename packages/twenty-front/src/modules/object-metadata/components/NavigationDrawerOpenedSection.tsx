import { useParams } from 'react-router-dom';

import { useFilteredObjectMetadataItemsForWorkspaceFavorites } from '@/navigation/hooks/useObjectMetadataItemsInWorkspaceFavorites';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';

export const NavigationDrawerOpenedSection = () => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const filteredActiveObjectMetadataItems = activeObjectMetadataItems.filter(
    (item) => !item.isRemote,
  );

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
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
        views={views}
        isRemote={false}
      />
    )
  );
};
