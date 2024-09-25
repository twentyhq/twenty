import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

import { currentUserState } from '@/auth/states/currentUserState';
import { useObjectMetadataItemsInWorkspaceFavorites } from '@/navigation/hooks/useObjectMetadataItemsInWorkspaceFavorites';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';

export const NavigationDrawerOpenedSection = () => {
  const currentUser = useRecoilValue(currentUserState);

  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const filteredActiveObjectMetadataItems = activeObjectMetadataItems.filter(
    (item) => !item.isRemote,
  );

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const loading = useIsPrefetchLoading();

  const currentPath = useLocation().pathname;
  const currentObjectNamePlural = extractObjectFromCurrentPath(currentPath);

  const { objectMetadataItems: objectMetadataItemsCurrentlyDisplayed } =
    useObjectMetadataItemsInWorkspaceFavorites();

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
    !objectMetadataItemsCurrentlyDisplayed
      .map((item) => item.id)
      .includes(objectMetadataItem.id);

  if (loading && isDefined(currentUser)) {
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

const extractObjectFromCurrentPath = (url: string): string | null => {
  const regex = /^\/objects\/([^/?]+)/;
  const match = url.match(regex);

  if (isDefined(match) && match.length > 1) {
    return match[1];
  }

  return null;
};
