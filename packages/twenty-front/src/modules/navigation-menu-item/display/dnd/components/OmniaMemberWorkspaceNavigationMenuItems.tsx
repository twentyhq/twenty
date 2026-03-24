import { useLingui } from '@lingui/react/macro';

import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { getOmniaMemberWorkspaceObjectMetadataItems } from '@/navigation-menu-item/common/utils/getOmniaMemberWorkspaceObjectMetadataItems';

export const OmniaMemberWorkspaceNavigationMenuItems = () => {
  const { t } = useLingui();
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();

  const omniaMemberWorkspaceObjectMetadataItems =
    getOmniaMemberWorkspaceObjectMetadataItems(
      activeNonSystemObjectMetadataItems,
    );

  return (
    <NavigationDrawerSectionForObjectMetadataItems
      sectionTitle={t`Workspace`}
      objectMetadataItems={omniaMemberWorkspaceObjectMetadataItems}
      isRemote={false}
      respectProvidedOrder
    />
  );
};
