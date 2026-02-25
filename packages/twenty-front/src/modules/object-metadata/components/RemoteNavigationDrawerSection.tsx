import { currentUserState } from '@/auth/states/currentUserState';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

export const RemoteNavigationDrawerSection = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const { t } = useLingui();

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
      sectionTitle={t`Remote`}
      objectMetadataItems={filteredActiveNonSystemObjectMetadataItems}
      isRemote={true}
    />
  );
};
