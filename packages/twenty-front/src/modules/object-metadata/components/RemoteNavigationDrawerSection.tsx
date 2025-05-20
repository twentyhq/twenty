import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { isDefined } from 'twenty-shared/utils';

export const RemoteNavigationDrawerSection = () => {
  const currentUser = useRecoilValue(currentUserState);

  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const filteredActiveNonSystemObjectMetadataItems =
    activeNonSystemObjectMetadataItems.filter((item) => item.isRemote);
  const loading = useIsPrefetchLoading();

  if (loading && isDefined(currentUser)) {
    return <NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader />;
  }

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={'Remote'}
      objectMetadataItems={filteredActiveNonSystemObjectMetadataItems}
      isRemote={true}
    />
  );
};
